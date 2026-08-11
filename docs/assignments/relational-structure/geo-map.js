const lpcWhere = [
  "Arch_Prima LIKE '%Mies%'",
  "Arch_Prima LIKE '%Breuer%'",
  "Arch_Prima LIKE '%Philip Johnson%'",
  "Arch_Prima LIKE '%Johnson/Burgee%'",
  "Arch_Prima LIKE '%Eero Saarinen%'",
  "Arch_Prima LIKE '%Kevin Roche%'",
  "Arch_Prima LIKE '%Paul Rudolph%'",
  "LPC_NAME LIKE '%Paul Rudolph%'"
].join(" OR ");

const lpcGeojsonUrl = `https://services5.arcgis.com/Oos4pNA2538iVFA1/ArcGIS/rest/services/Ind_Landmark_Lots_POLY/FeatureServer/0/query?where=${encodeURIComponent(lpcWhere)}&outFields=LPC_NAME,Address,BORO,NEIGHBORHO,Arch_Prima,Arch_Alter,Style_Prim,BuildType,USE_ORIG,Date_Comb,LandmarkTy,URL_REPORT&returnGeometry=true&outSR=4326&f=geojson&resultRecordCount=2000`;

const mapboxToken = (window.MAPBOX_ACCESS_TOKEN || "").trim();
const hasMapboxToken = /^pk\.[A-Za-z0-9._-]+$/.test(mapboxToken) && !mapboxToken.includes("XXXX");

const architectCrosswalk = [
  { name: "Ludwig Mies van der Rohe", short: "Mies van der Rohe", birth: 1886, terms: ["ludwig mies van der rohe", "mies van der rohe"], fields: ["architect"], color: "#101010" },
  { name: "Marcel Breuer", short: "Marcel Breuer", birth: 1902, terms: ["marcel breuer", "breuer associates"], fields: ["architect"], color: "#174e96" },
  { name: "Philip Johnson", short: "Philip Johnson", birth: 1906, terms: ["philip johnson", "johnson burgee"], fields: ["architect"], color: "#e31b2d" },
  { name: "Eero Saarinen", short: "Eero Saarinen", birth: 1910, terms: ["eero saarinen"], fields: ["architect"], color: "#e5b421" },
  { name: "Paul Rudolph", short: "Paul Rudolph", birth: 1918, terms: ["paul rudolph"], fields: ["architect", "name"], color: "#6b6b66" },
  { name: "Kevin Roche", short: "Kevin Roche", birth: 1922, terms: ["kevin roche", "roche john dinkeloo"], fields: ["architect"], color: "#7f2d3a" }
];

const architectColors = Object.fromEntries(architectCrosswalk.map(architect => [architect.name, architect.color]));

let landmarkMap;
let landmarkData;
let centroidData;
let activeArchitect = "all";

const mapEls = {
  architectFilter: document.getElementById("architect-filter"),
  featureCount: document.getElementById("map-feature-count"),
  architectCount: document.getElementById("map-architect-count"),
  status: document.getElementById("map-status-text"),
  legend: document.getElementById("map-legend"),
  reset: document.getElementById("map-reset")
};

loadGeoMap();

async function loadGeoMap() {
  try {
    const [nodeRows, lpcData] = await Promise.all([
      d3.csv("nodes.csv"),
      d3.json(lpcGeojsonUrl)
    ]);
    landmarkData = filterToMomaArchitects(lpcData, nodeRows);
    centroidData = makeCentroids(landmarkData);
    populateArchitectFilter(landmarkData);
    renderMapLegend(landmarkData);
    setupMap(landmarkData, centroidData);
    updateMapText();
  } catch (error) {
    mapEls.status.textContent = "The geospatial data could not be loaded.";
    console.error(error);
  }
}

function filterToMomaArchitects(lpcData, nodeRows) {
  const nodeNames = new Set(nodeRows.map(row => row.name));
  const activeCrosswalk = architectCrosswalk.filter(architect => nodeNames.has(architect.name));
  const features = [];

  for (const feature of lpcData.features || []) {
    const matches = activeCrosswalk.filter(architect => featureMatchesArchitect(feature, architect));
    if (!matches.length) continue;

    const primary = matches[0];
    const props = feature.properties || {};
    features.push({
      ...feature,
      properties: {
        ...props,
        moma_architects: matches.map(architect => architect.name).join("; "),
        moma_architect_short: matches.map(architect => architect.short).join(" + "),
        moma_primary_architect: primary.name,
        moma_primary_short: primary.short,
        moma_birth_years: matches.map(architect => architect.birth).join("; "),
        moma_color: primary.color,
        match_note: matches.some(architect => architect.name === "Paul Rudolph") &&
          normalizeText(props.LPC_NAME).includes("paul rudolph") &&
          !normalizeText([props.Arch_Prima, props.Arch_Alter].join(" ")).includes("paul rudolph")
          ? "Related by landmark name in the LPC record"
          : "Architect/builder field match in the LPC record"
      }
    });
  }

  features.sort((a, b) =>
    String(a.properties.moma_primary_architect).localeCompare(String(b.properties.moma_primary_architect)) ||
    String(a.properties.LPC_NAME).localeCompare(String(b.properties.LPC_NAME))
  );

  return {
    type: "FeatureCollection",
    source: "NYC LPC individual landmark boundaries filtered to architects present in nodes.csv",
    features
  };
}

function featureMatchesArchitect(feature, architect) {
  return architect.fields.some(fieldMode => {
    const haystack = textForFeature(feature, fieldMode);
    return architect.terms.map(normalizeText).some(term => haystack.includes(term));
  });
}

function textForFeature(feature, fieldMode) {
  const props = feature.properties || {};
  const architectText = [props.Arch_Prima, props.Arch_Alter].filter(Boolean).join(" ");
  if (fieldMode === "name") return normalizeText([architectText, props.LPC_NAME].join(" "));
  return normalizeText(architectText);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function setupMap(data, centroids) {
  if (hasMapboxToken) mapboxgl.accessToken = mapboxToken;

  landmarkMap = new mapboxgl.Map({
    container: "landmark-map",
    style: hasMapboxToken ? "mapbox://styles/mapbox/light-v10" : openRasterStyle(),
    center: [-73.975, 40.744],
    zoom: 10.7,
    pitch: 36,
    bearing: -13
  });

  landmarkMap.addControl(new mapboxgl.NavigationControl(), "top-right");
  landmarkMap.addControl(new mapboxgl.ScaleControl({ maxWidth: 90, unit: "imperial" }), "bottom-left");

  landmarkMap.on("load", () => {
    landmarkMap.addSource("moma-landmarks", {
      type: "geojson",
      data,
      generateId: true
    });

    landmarkMap.addSource("moma-centroids", {
      type: "geojson",
      data: centroids,
      generateId: true
    });

    landmarkMap.addLayer({
      id: "moma-landmark-fill",
      type: "fill",
      source: "moma-landmarks",
      paint: {
        "fill-color": colorExpression(),
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.84,
          0.58
        ]
      }
    });

    landmarkMap.addLayer({
      id: "moma-landmark-line",
      type: "line",
      source: "moma-landmarks",
      paint: {
        "line-color": "#101010",
        "line-opacity": 0.78,
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.8, 14, 2.2, 17, 4]
      }
    });

    landmarkMap.addLayer({
      id: "moma-landmark-centroid",
      type: "circle",
      source: "moma-centroids",
      paint: {
        "circle-color": colorExpression(),
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 4, 13, 7, 16, 10],
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1.5,
        "circle-opacity": 0.94
      }
    });

    bindMapEvents();
    fitVisibleLandmarks(0);
  });
}

function openRasterStyle() {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        attribution: "OpenStreetMap contributors"
      }
    },
    layers: [{
      id: "osm-raster",
      type: "raster",
      source: "osm",
      paint: {
        "raster-saturation": -0.88,
        "raster-contrast": 0.12,
        "raster-brightness-min": 0.12,
        "raster-brightness-max": 0.97
      }
    }]
  };
}

function populateArchitectFilter(data) {
  const architects = Array.from(new Set(
    data.features.flatMap(feature => feature.properties.moma_architects.split("; "))
  )).sort();

  architects.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = shortArchitectName(name);
    mapEls.architectFilter.appendChild(option);
  });

  mapEls.architectFilter.addEventListener("change", () => {
    activeArchitect = mapEls.architectFilter.value;
    updateMapFilter();
    fitVisibleLandmarks(700);
  });

  mapEls.reset.addEventListener("click", () => fitVisibleLandmarks(700));
}

function renderMapLegend(data) {
  const architects = Array.from(new Set(
    data.features.flatMap(feature => feature.properties.moma_architects.split("; "))
  )).sort();
  mapEls.legend.innerHTML = "";
  architects.forEach(name => {
    const item = document.createElement("span");
    item.innerHTML = `<i style="background:${architectColors[name] || "#101010"}"></i>${shortArchitectName(name)}`;
    mapEls.legend.appendChild(item);
  });
}

function colorExpression() {
  const expression = ["match", ["get", "moma_primary_architect"]];
  Object.entries(architectColors).forEach(([name, color]) => expression.push(name, color));
  expression.push("#101010");
  return expression;
}

function updateMapFilter() {
  if (!landmarkMap || !landmarkMap.getLayer("moma-landmark-fill")) return;
  const filter = activeArchitect === "all"
    ? null
    : ["in", activeArchitect, ["get", "moma_architects"]];

  ["moma-landmark-fill", "moma-landmark-line", "moma-landmark-centroid"].forEach(layer => {
    landmarkMap.setFilter(layer, filter);
  });

  const currentColor = activeArchitect === "all"
    ? colorExpression()
    : (architectColors[activeArchitect] || "#101010");
  landmarkMap.setPaintProperty("moma-landmark-fill", "fill-color", currentColor);
  landmarkMap.setPaintProperty("moma-landmark-centroid", "circle-color", currentColor);
  updateMapText();
}

function updateMapText() {
  const features = visibleFeatures();
  const architects = new Set(features.flatMap(feature => feature.properties.moma_architects.split("; ")));
  mapEls.featureCount.textContent = features.length;
  mapEls.architectCount.textContent = architects.size;
  mapEls.status.textContent = `${features.length} landmark footprints shown / ${hasMapboxToken ? "Mapbox light style" : "open basemap fallback"}`;
}

function visibleFeatures() {
  if (!landmarkData) return [];
  if (activeArchitect === "all") return landmarkData.features;
  return landmarkData.features.filter(feature => feature.properties.moma_architects.split("; ").includes(activeArchitect));
}

function fitVisibleLandmarks(duration) {
  const features = visibleFeatures();
  if (!landmarkMap || !features.length) return;

  const bounds = new mapboxgl.LngLatBounds();
  features.forEach(feature => flattenCoordinates(feature.geometry.coordinates).forEach(coord => bounds.extend(coord)));
  if (bounds.isEmpty()) return;

  landmarkMap.fitBounds(bounds, {
    padding: { top: 64, right: 64, bottom: 64, left: 64 },
    maxZoom: activeArchitect === "all" ? 11.7 : 15.7,
    duration
  });
}

function bindMapEvents() {
  let hoveredId = null;

  landmarkMap.on("mousemove", "moma-landmark-fill", event => {
    if (!event.features.length) return;
    landmarkMap.getCanvas().style.cursor = "pointer";
    if (hoveredId !== null) {
      landmarkMap.setFeatureState({ source: "moma-landmarks", id: hoveredId }, { hover: false });
    }
    hoveredId = event.features[0].id;
    landmarkMap.setFeatureState({ source: "moma-landmarks", id: hoveredId }, { hover: true });
  });

  landmarkMap.on("mouseleave", "moma-landmark-fill", () => {
    landmarkMap.getCanvas().style.cursor = "";
    if (hoveredId !== null) {
      landmarkMap.setFeatureState({ source: "moma-landmarks", id: hoveredId }, { hover: false });
    }
    hoveredId = null;
  });

  ["moma-landmark-fill", "moma-landmark-centroid"].forEach(layer => {
    landmarkMap.on("click", layer, event => {
      if (!event.features.length) return;
      showLandmarkPopup(event.lngLat, event.features[0].properties);
    });
  });
}

function showLandmarkPopup(lngLat, props) {
  const report = props.URL_REPORT
    ? `<a href="${props.URL_REPORT}" target="_blank" rel="noreferrer">Designation report</a>`
    : "";
  const html = `
    <div class="map-popup">
      <p class="popup-kicker">${escapeHtml(props.moma_architect_short)}</p>
      <h3>${escapeHtml(props.LPC_NAME)}</h3>
      <p><b>LPC architect field</b><br>${escapeHtml(props.Arch_Prima || "Not listed")}</p>
      <p><b>Date</b><br>${escapeHtml(props.Date_Comb || "Not listed")}</p>
      <p><b>Address</b><br>${escapeHtml(props.Address || "Not listed")}</p>
      <p>${escapeHtml(props.match_note)}</p>
      ${report}
    </div>
  `;
  new mapboxgl.Popup({ closeButton: true, maxWidth: "310px" })
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(landmarkMap);
}

function makeCentroids(data) {
  return {
    type: "FeatureCollection",
    features: data.features.map(feature => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: geometryCenter(feature.geometry)
      },
      properties: feature.properties
    }))
  };
}

function geometryCenter(geometry) {
  const coords = flattenCoordinates(geometry.coordinates);
  const sum = coords.reduce((acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]], [0, 0]);
  return coords.length ? [sum[0] / coords.length, sum[1] / coords.length] : [-73.975, 40.744];
}

function flattenCoordinates(coords) {
  if (!Array.isArray(coords)) return [];
  if (typeof coords[0] === "number") return [coords];
  return coords.flatMap(flattenCoordinates);
}

function shortArchitectName(name) {
  return {
    "Ludwig Mies van der Rohe": "Mies van der Rohe"
  }[name] || name;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}
