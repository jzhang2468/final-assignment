const palette = { americas: "#e31b2d", europe: "#174e96", asia: "#e5b421" };
const regionLabels = { americas: "Architect / Americas", europe: "Architect / Europe", asia: "Architect / Asia" };
const container = d3.select("#network");
const tooltip = d3.select("#tooltip");

Promise.all([d3.csv("nodes.csv"), d3.csv("edges.csv")])
  .then(([nodeRows, edgeRows]) => {
    container.select(".loading").remove();
    const nodes = nodeRows.map(d => ({ ...d, age: +d.age, friends: +d.friends, size: +d.size }));
    const links = edgeRows.map(d => ({ ...d, since: +d.since, strength: +d.strength }));
    d3.select("#node-count").text(nodes.length);
    d3.select("#edge-count").text(links.length);
    drawNetwork(nodes, links);
  })
  .catch(error => {
    container.select(".loading").text("The network data could not be loaded.");
    console.error(error);
  });

function drawNetwork(nodes, links) {
  const element = container.node();
  let width = element.clientWidth;
  let height = element.clientHeight;
  let currentView = "timeline";
  let xScale = makeYearScale(width);
  const radius = d3.scaleSqrt().domain(d3.extent(nodes, d => d.friends)).range([12, 25]);

  const svg = container.append("svg").attr("viewBox", [0, 0, width, height]).attr("aria-hidden", "true");
  const scene = svg.append("g");
  const guideLayer = scene.append("g").attr("class", "guide-layer");
  const linkLayer = scene.append("g");
  const nodeLayer = scene.append("g");
  const labelLayer = scene.append("g");

  const link = linkLayer.selectAll("line").data(links).join("line")
    .attr("class", "link")
    .attr("stroke", "#8d8d8d")
    .attr("stroke-opacity", .34)
    .attr("stroke-width", d => .45 + d.strength * 1.7);

  const node = nodeLayer.selectAll(".node").data(nodes).join("circle")
    .attr("class", "node")
    .attr("r", d => radius(d.friends))
    .attr("fill", d => palette[d.role] || d.color)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3);

  const ring = nodeLayer.selectAll(".node-ring").data(nodes).join("circle")
    .attr("class", "node-ring")
    .attr("r", d => radius(d.friends) - 4);

  const labels = labelLayer.selectAll("text").data(nodes).join("text")
    .attr("class", "node-label")
    .attr("dy", d => radius(d.friends) + 15)
    .text(d => labelName(d.name));

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id)
      .distance(d => 72 + (1 - d.strength) * 55)
      .strength(d => .18 + d.strength * .26))
    .force("charge", d3.forceManyBody().strength(-290))
    .force("collision", d3.forceCollide().radius(d => radius(d.friends) + 31).iterations(2));

  updateGuides();
  setLayout("timeline", false);

  simulation.on("tick", () => {
    link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node.attr("cx", d => d.x).attr("cy", d => d.y);
    ring.attr("cx", d => d.x).attr("cy", d => d.y);
    labels.attr("x", d => d.x).attr("y", d => d.y);
  });

  node.call(d3.drag()
    .on("start", (event, d) => {
      event.sourceEvent.stopPropagation();
      if (!event.active) simulation.alphaTarget(.22).restart();
      d.fx = d.x; d.fy = d.y;
    })
    .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
    }))
    .on("pointerenter", (event, d) => {
      const neighbors = new Set([d.id]);
      links.forEach(l => {
        if (l.source.id === d.id) neighbors.add(l.target.id);
        if (l.target.id === d.id) neighbors.add(l.source.id);
      });
      node.attr("opacity", n => neighbors.has(n.id) ? 1 : .1);
      ring.attr("opacity", n => neighbors.has(n.id) ? 1 : .08);
      labels.attr("opacity", n => neighbors.has(n.id) ? 1 : .07);
      link.attr("stroke-opacity", l => l.source.id === d.id || l.target.id === d.id ? .92 : .035);
      showTooltip(event, d, neighbors.size - 1);
    })
    .on("pointermove", positionTooltip)
    .on("pointerleave", () => {
      node.attr("opacity", 1); ring.attr("opacity", 1); labels.attr("opacity", 1); link.attr("stroke-opacity", .34);
      tooltip.classed("visible", false).attr("aria-hidden", "true");
    });

  const zoom = d3.zoom().scaleExtent([.45, 3.5]).on("zoom", event => scene.attr("transform", event.transform));
  svg.call(zoom).on("dblclick.zoom", null);

  d3.selectAll(".view-button").on("click", function() {
    d3.selectAll(".view-button").classed("active", false);
    d3.select(this).classed("active", true);
    setLayout(this.dataset.view, true);
  });

  d3.select("#reset").on("click", () => {
    svg.transition().duration(550).call(zoom.transform, d3.zoomIdentity);
    nodes.forEach(d => { d.fx = null; d.fy = null; });
    simulation.alpha(.55).restart();
  });

  new ResizeObserver(() => {
    width = element.clientWidth;
    height = element.clientHeight;
    xScale = makeYearScale(width);
    svg.attr("viewBox", [0, 0, width, height]);
    updateGuides();
    setLayout(currentView, true);
  }).observe(element);

  function setLayout(view, animate) {
    currentView = view;
    const regionY = { americas: height * .34, europe: height * .56, asia: height * .72 };
    if (view === "timeline") {
      simulation
        .force("center", null)
        .force("x", d3.forceX(d => xScale(d.age)).strength(.75))
        .force("y", d3.forceY(d => regionY[d.role] || height / 2).strength(.12));
      guideLayer.transition().duration(animate ? 350 : 0).attr("opacity", 1);
    } else {
      simulation
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(.035))
        .force("y", d3.forceY(height / 2).strength(.045));
      guideLayer.transition().duration(animate ? 250 : 0).attr("opacity", 0);
    }
    simulation.alpha(animate ? .75 : 1).restart();
  }

  function updateGuides() {
    const decades = d3.range(1890, 1970, 10);
    guideLayer.selectAll("line").data(decades).join("line")
      .attr("class", "decade-line")
      .attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
      .attr("y1", 45).attr("y2", height - 35);
    guideLayer.selectAll("text").data(decades).join("text")
      .attr("class", "decade-label")
      .attr("x", d => xScale(d) + 6).attr("y", 30)
      .text(d => d);
  }
}

function makeYearScale(width) {
  return d3.scaleLinear().domain([1883, 1956]).range([70, Math.max(250, width - 70)]);
}

function showTooltip(event, d, ties) {
  tooltip.html(`
    <div class="type">${regionLabels[d.role] || d.role}</div>
    <h2>${d.name}</h2>
    <p><strong>${d.department}</strong></p>
    <p>Birth year / <strong>${d.age}</strong></p>
    <p>Architects in cohort / <strong>${ties}</strong></p>
    <p>Link rule / <strong>birth years no more than 6 years apart</strong></p>
  `).classed("visible", true).attr("aria-hidden", "false");
  positionTooltip(event);
}

function positionTooltip(event) {
  const bounds = container.node().getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  const left = x > bounds.width - 290 ? x - 278 : x + 12;
  const top = Math.max(94, Math.min(bounds.height - 94, y));
  tooltip.style("left", `${left}px`).style("top", `${top}px`);
}

function labelName(name) {
  const exceptions = {
    "Ludwig Mies van der Rohe": "Mies van der Rohe",
    "R. Buckminster Fuller": "B. Fuller",
    "Denise Scott Brown": "D. Scott Brown",
    "Lina Bo Bardi": "L. Bo Bardi",
    "Aino Aalto": "Aino Aalto",
    "Alvar Aalto": "Alvar Aalto",
    "Charles Eames": "Charles Eames",
    "Ray Eames": "Ray Eames"
  };
  if (exceptions[name]) return exceptions[name];
  const parts = name.split(" ");
  return `${parts[0][0]}. ${parts.at(-1)}`;
}
