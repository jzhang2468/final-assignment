import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const ink = 0x121417;
const vellum = 0xf4efe4;
const field = 0xe9ece5;
const blueprint = 0x164e63;
const copper = 0xc85c36;
const glass = 0x74c7d3;
const acid = 0xd6ff5c;
const violet = 0x6b63d8;
const charcoal = 0x11161a;

const threeScenes = [];

function seededRandom(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  return renderer;
}

function installResize(container, renderer, camera) {
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();
}

function addEdges(mesh, color = ink, opacity = 0.34) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  mesh.add(edges);
  return edges;
}

function getSketchSize(container) {
  const rect = container.getBoundingClientRect();
  return {
    width: Math.max(320, Math.round(rect.width)),
    height: Math.max(320, Math.round(rect.height))
  };
}

function box(group, size, position, material, edgeColor = ink, edgeOpacity = 0.25) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  addEdges(mesh, edgeColor, edgeOpacity);
  group.add(mesh);
  return mesh;
}

function createArchiveLabel(text, accent = acid) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(17, 22, 26, 0.92)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = `#${accent.toString(16).padStart(6, "0")}`;
  ctx.lineWidth = 7;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  ctx.fillStyle = `#${accent.toString(16).padStart(6, "0")}`;
  ctx.font = "25px Arial, sans-serif";
  ctx.fillText("architectural index", 34, 52);
  ctx.font = "700 54px Arial, sans-serif";
  ctx.fillText(text, 34, 120);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(1.55, 0.48, 1);
  return sprite;
}

function setupArchiveAtrium() {
  const container = document.getElementById("three-archive-atrium");
  if (!container) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(field);
  scene.fog = new THREE.Fog(field, 6.5, 22);

  const camera = new THREE.PerspectiveCamera(62, container.clientWidth / container.clientHeight, 0.1, 80);
  camera.position.set(0.35, 1.65, 7.4);

  const renderer = createRenderer(container);
  renderer.shadowMap.enabled = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.45, 1.2);
  controls.minDistance = 0.7;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI * 0.88;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x75807b, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(-2.5, 7.5, 5.5);
  sun.castShadow = true;
  scene.add(sun);
  const warmProbe = new THREE.PointLight(copper, 2.4, 9);
  scene.add(warmProbe);

  const building = new THREE.Group();
  scene.add(building);

  const floorMat = new THREE.MeshStandardMaterial({ color: vellum, roughness: 0.82, metalness: 0.02 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd8ddd6, roughness: 0.78, metalness: 0.02 });
  const frameMat = new THREE.MeshStandardMaterial({ color: blueprint, roughness: 0.42, metalness: 0.24 });
  const copperMat = new THREE.MeshStandardMaterial({ color: copper, roughness: 0.44, metalness: 0.18 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x20292d, roughness: 0.72, metalness: 0.05 });
  const acidMat = new THREE.MeshStandardMaterial({ color: acid, roughness: 0.35, metalness: 0.08, emissive: acid, emissiveIntensity: 0.08 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: glass,
    roughness: 0.06,
    metalness: 0,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide
  });

  box(building, [6.4, 0.12, 22], [0, -0.08, -2.6], floorMat, blueprint, 0.18);
  box(building, [6.4, 0.1, 22], [0, 4.18, -2.6], wallMat, blueprint, 0.16);
  box(building, [0.12, 3.9, 22], [-3.2, 1.95, -2.6], wallMat, blueprint, 0.16);
  box(building, [0.12, 3.9, 22], [3.2, 1.95, -2.6], wallMat, blueprint, 0.16);

  for (let z = 7.2; z >= -12.2; z -= 2.2) {
    box(building, [6.45, 0.08, 0.12], [0, 3.35, z], frameMat, acid, 0.28);
    box(building, [0.12, 3.45, 0.12], [-2.55, 1.65, z], frameMat, acid, 0.22);
    box(building, [0.12, 3.45, 0.12], [2.55, 1.65, z], frameMat, acid, 0.22);
    box(building, [0.9, 0.08, 0.12], [-1.15, 2.55, z], copperMat, vellum, 0.22);
    box(building, [0.9, 0.08, 0.12], [1.15, 2.55, z], copperMat, vellum, 0.22);
  }

  for (let z = 6.4; z >= -11.6; z -= 2.4) {
    box(building, [0.18, 2.35, 0.18], [-2.08, 1.08, z], frameMat, acid, 0.24);
    box(building, [0.18, 2.35, 0.18], [2.08, 1.08, z], frameMat, acid, 0.24);
    box(building, [1.05, 0.06, 0.8], [-2.75, 1.15, z - 0.45], glassMat, blueprint, 0.18);
    box(building, [1.05, 0.06, 0.8], [2.75, 1.15, z - 0.45], glassMat, blueprint, 0.18);
  }

  for (let z = 5.8; z >= -9.8; z -= 2.6) {
    const bridge = box(building, [3.1, 0.09, 0.82], [0, 2.35, z], glassMat, glass, 0.28);
    bridge.rotation.y = z % 2 ? 0.035 : -0.035;
    box(building, [3.4, 0.06, 0.06], [0, 2.82, z - 0.39], frameMat, acid, 0.2);
    box(building, [3.4, 0.06, 0.06], [0, 2.82, z + 0.39], frameMat, acid, 0.2);
  }

  for (let i = 0; i < 18; i += 1) {
    const z = 5.7 - i * 0.62;
    const y = 0.12 + i * 0.06;
    const tread = box(building, [1.55, 0.06, 0.34], [-1.45 + i * 0.055, y, z], copperMat, vellum, 0.2);
    tread.rotation.y = -0.22;
  }
  box(building, [0.08, 1.38, 5.6], [-0.72, 0.88, 0.4], frameMat, acid, 0.18).rotation.y = -0.22;

  for (let i = 0; i < 10; i += 1) {
    const shelfZ = 6.7 - i * 1.7;
    box(building, [0.75, 0.12, 0.9], [-2.8, 0.35 + (i % 3) * 0.42, shelfZ], i % 4 === 0 ? acidMat : darkMat, vellum, 0.24);
    box(building, [0.75, 0.12, 0.9], [2.8, 0.35 + ((i + 1) % 3) * 0.42, shelfZ - 0.55], i % 3 === 0 ? copperMat : darkMat, vellum, 0.24);
  }

  const roofCut = new THREE.Mesh(
    new THREE.PlaneGeometry(4.9, 17.5),
    new THREE.MeshBasicMaterial({ color: acid, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
  );
  roofCut.rotation.x = Math.PI / 2;
  roofCut.position.set(0, 4.12, -2.2);
  building.add(roofCut);

  const travelLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.05, 7.2),
      new THREE.Vector3(0.75, 0.05, 3.4),
      new THREE.Vector3(-0.6, 0.05, -1.4),
      new THREE.Vector3(0.4, 0.05, -6.4),
      new THREE.Vector3(0, 0.05, -11.3)
    ]),
    new THREE.LineBasicMaterial({ color: violet, transparent: true, opacity: 0.96 })
  );
  building.add(travelLine);

  const labels = [
    ["LIGHT WELL", -1.7, 3.55, 1.2, acid],
    ["MEZZANINE", 1.2, 2.8, -2.4, glass],
    ["RAMP", -1.55, 1.35, 4.3, copper],
    ["STACKS", 2.2, 1.25, -6.2, violet]
  ];
  labels.forEach(([text, x, y, z, accent]) => {
    const label = createArchiveLabel(text, accent);
    label.position.set(x, y, z);
    building.add(label);
  });

  installResize(container, renderer, camera);
  threeScenes.push({
    scene,
    camera,
    renderer,
    controls,
    update(time) {
      const travel = (Math.sin(time * 0.22) + 1) / 2;
      const z = 7.2 - travel * 13.8;
      const x = Math.sin(time * 0.38) * 0.55;
      const y = 1.35 + Math.sin(time * 0.31) * 0.22;
      camera.position.lerp(new THREE.Vector3(x, y, z), 0.035);
      controls.target.lerp(new THREE.Vector3(Math.sin(time * 0.21) * 0.35, 1.55, z - 3.4), 0.045);
      roofCut.material.opacity = 0.06 + Math.sin(time * 1.3) * 0.025;
      warmProbe.position.set(Math.sin(time * 0.74) * 2.3, 1.7 + Math.cos(time * 0.4) * 0.65, z - 1.2);
      controls.update();
    }
  });
}

function setupFogArchive() {
  const container = document.getElementById("three-material-vault");
  if (!container) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11161a);
  scene.fog = new THREE.Fog(0x11161a, 3.2, 18);

  const camera = new THREE.PerspectiveCamera(66, container.clientWidth / container.clientHeight, 0.1, 80);
  camera.position.set(0.35, 1.38, 6.7);

  const renderer = createRenderer(container);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.2, 2.8);
  controls.minDistance = 0.7;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI * 0.9;

  scene.add(new THREE.AmbientLight(0x5ea9b0, 0.48));
  const softBox = new THREE.DirectionalLight(0xf4efe4, 1.7);
  softBox.position.set(-2.6, 5.4, 4.2);
  scene.add(softBox);
  const movingLight = new THREE.PointLight(acid, 7.5, 12);
  scene.add(movingLight);

  const vault = new THREE.Group();
  scene.add(vault);

  const concrete = new THREE.MeshStandardMaterial({ color: 0x222a2d, roughness: 0.9, metalness: 0.02 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xb9c1bc, roughness: 0.35, metalness: 0.72 });
  const copperMat = new THREE.MeshStandardMaterial({ color: copper, roughness: 0.42, metalness: 0.28, emissive: copper, emissiveIntensity: 0.12 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaee8ec,
    roughness: 0.12,
    metalness: 0.02,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide
  });
  const acidMat = new THREE.MeshStandardMaterial({ color: acid, roughness: 0.3, metalness: 0.42, emissive: acid, emissiveIntensity: 0.16 });

  box(vault, [5.2, 0.14, 20], [0, -0.1, -2.5], concrete, 0x74c7d3, 0.14);
  box(vault, [0.12, 3.4, 20], [-2.6, 1.52, -2.5], concrete, 0x74c7d3, 0.12);
  box(vault, [0.12, 3.4, 20], [2.6, 1.52, -2.5], concrete, 0x74c7d3, 0.12);
  box(vault, [5.2, 0.12, 20], [0, 3.22, -2.5], concrete, 0x74c7d3, 0.12);

  for (let z = 6.4; z >= -12.2; z -= 1.55) {
    box(vault, [5.25, 0.09, 0.13], [0, 2.95, z], metal, acid, 0.18);
    box(vault, [0.11, 3.15, 0.13], [-2.25, 1.45, z], metal, acid, 0.16);
    box(vault, [0.11, 3.15, 0.13], [2.25, 1.45, z], metal, acid, 0.16);
  }

  for (let z = 5.7; z >= -11; z -= 1.6) {
    box(vault, [0.72, 0.62, 0.88], [-2.05, 0.48, z], glassMat, glass, 0.2);
    box(vault, [0.72, 0.62, 0.88], [2.05, 0.48, z - 0.55], glassMat, glass, 0.2);
    box(vault, [0.82, 0.08, 0.92], [-2.05, 1.05, z], metal, glass, 0.16);
    box(vault, [0.82, 0.08, 0.92], [2.05, 1.05, z - 0.55], metal, glass, 0.16);
  }

  const random = seededRandom(404);
  for (let i = 0; i < 46; i += 1) {
    const size = 0.14 + random() * 0.42;
    const geom = i % 5 === 0
      ? new THREE.CylinderGeometry(size * 0.34, size * 0.34, size * 1.25, 8)
      : new THREE.BoxGeometry(size, 0.06 + random() * 0.42, size * (0.55 + random()));
    const mat = i % 9 === 0 ? acidMat : i % 6 === 0 ? copperMat : concrete;
    const piece = new THREE.Mesh(geom, mat);
    piece.position.set((random() - 0.5) * 3.4, 0.22 + random() * 2.2, 6.2 - random() * 17.5);
    piece.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    addEdges(piece, i % 9 === 0 ? vellum : 0x87908b, 0.24);
    vault.add(piece);
  }

  const positions = [];
  for (let i = 0; i < 720; i += 1) {
    positions.push((random() - 0.5) * 5, -0.1 + random() * 3.5, 7 - random() * 20);
  }
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const points = new THREE.Points(
    pointGeometry,
    new THREE.PointsMaterial({ color: 0xd6ff5c, size: 0.026, transparent: true, opacity: 0.5, depthWrite: false })
  );
  vault.add(points);

  const scanner = new THREE.Mesh(
    new THREE.BoxGeometry(4.9, 0.025, 0.05),
    new THREE.MeshBasicMaterial({ color: glass, transparent: true, opacity: 0.95 })
  );
  scanner.position.y = 1.1;
  vault.add(scanner);

  const sectionPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.9, 3.3),
    new THREE.MeshBasicMaterial({ color: copper, transparent: true, opacity: 0.07, side: THREE.DoubleSide })
  );
  sectionPlane.rotation.x = Math.PI / 2;
  vault.add(sectionPlane);

  const path = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.04, 6.4),
      new THREE.Vector3(-0.5, 0.04, 3.6),
      new THREE.Vector3(0.55, 0.04, -0.5),
      new THREE.Vector3(-0.35, 0.04, -5.2),
      new THREE.Vector3(0, 0.04, -11.5)
    ]),
    new THREE.LineBasicMaterial({ color: acid, transparent: true, opacity: 0.85 })
  );
  vault.add(path);

  installResize(container, renderer, camera);
  threeScenes.push({
    scene,
    camera,
    renderer,
    controls,
    update(time) {
      const travel = (Math.sin(time * 0.18) + 1) / 2;
      const z = 6.5 - travel * 15.7;
      const x = Math.sin(time * 0.43) * 0.42;
      camera.position.lerp(new THREE.Vector3(x, 1.22 + Math.sin(time * 0.27) * 0.16, z), 0.036);
      controls.target.lerp(new THREE.Vector3(Math.sin(time * 0.28) * 0.3, 1.18, z - 3.2), 0.045);
      scanner.position.z = z - 2.3 + Math.sin(time * 1.15) * 0.65;
      sectionPlane.position.z = scanner.position.z;
      movingLight.position.set(Math.sin(time * 0.8) * 1.8, 1.1 + Math.cos(time * 0.5) * 0.7, scanner.position.z + 0.9);
      points.rotation.y = Math.sin(time * 0.18) * 0.04;
      controls.update();
    }
  });
}

function animateThree(time = 0) {
  const seconds = time * 0.001;
  threeScenes.forEach((entry) => {
    entry.update(seconds);
    entry.renderer.render(entry.scene, entry.camera);
  });
  requestAnimationFrame(animateThree);
}

function drawArchiveGround(p) {
  p.background(244, 239, 228);
  p.noStroke();
  p.fill(116, 199, 211, 25);
  p.rect(0, 0, p.width, p.height);
  p.fill(244, 239, 228, 225);
  p.rect(p.width * 0.04, p.height * 0.07, p.width * 0.92, p.height * 0.84);

  const spacing = Math.max(18, p.width / 34);
  p.stroke(18, 20, 23, 24);
  p.strokeWeight(1);
  for (let x = 0; x <= p.width; x += spacing) p.line(x, 0, x, p.height);
  for (let y = 0; y <= p.height; y += spacing) p.line(0, y, p.width, y);
}

function drawDoor(p, x, y, radius, orientation) {
  p.noFill();
  p.stroke(200, 92, 54);
  p.strokeWeight(1.6);
  if (orientation === "right") {
    p.line(x, y, x + radius, y);
    p.arc(x, y, radius * 2, radius * 2, 0, p.HALF_PI);
  } else if (orientation === "left") {
    p.line(x, y, x - radius, y);
    p.arc(x, y, radius * 2, radius * 2, p.HALF_PI, p.PI);
  } else if (orientation === "up") {
    p.line(x, y, x, y - radius);
    p.arc(x, y, radius * 2, radius * 2, p.PI, p.PI + p.HALF_PI);
  } else {
    p.line(x, y, x, y + radius);
    p.arc(x, y, radius * 2, radius * 2, p.PI + p.HALF_PI, p.TWO_PI);
  }
}

function staticSectionSketch(p) {
  let container;

  function fit() {
    if (!container) return;
    const { width, height } = getSketchSize(container);
    p.resizeCanvas(width, height);
    p.redraw();
  }

  p.setup = function setup() {
    container = document.getElementById("p5-plan-catalogue");
    const { width, height } = getSketchSize(container);
    const canvas = p.createCanvas(width, height);
    canvas.parent(container);
    p.pixelDensity(Math.min(window.devicePixelRatio, 2));
    p.noLoop();
  };

  p.windowResized = fit;

  p.draw = function draw() {
    drawArchiveGround(p);
    const w = p.width;
    const h = p.height;
    const ox = w * 0.07;
    const oy = h * 0.16;
    const pw = w * 0.78;
    const ph = h * 0.68;
    const t = Math.max(5, Math.min(w, h) * 0.014);

    p.noStroke();
    p.fill(22, 78, 99);
    p.textFont("Arial");
    p.textSize(Math.max(20, Math.min(w, h) * 0.052));
    p.text("Plan Catalogue", w * 0.07, h * 0.13);

    p.stroke(18, 20, 23);
    p.strokeWeight(t);
    p.noFill();
    p.rect(ox, oy, pw, ph);

    const atrium = { x: ox + pw * 0.38, y: oy + ph * 0.28, w: pw * 0.24, h: ph * 0.32 };
    p.strokeWeight(t * 0.78);
    p.rect(atrium.x, atrium.y, atrium.w, atrium.h);
    p.strokeWeight(t * 0.5);
    p.rect(atrium.x + t * 1.3, atrium.y + t * 1.3, atrium.w - t * 2.6, atrium.h - t * 2.6);

    p.strokeWeight(t * 0.55);
    const walls = [
      [ox + pw * 0.26, oy, ox + pw * 0.26, oy + ph],
      [ox + pw * 0.74, oy, ox + pw * 0.74, oy + ph],
      [ox, oy + ph * 0.28, ox + pw, oy + ph * 0.28],
      [ox, oy + ph * 0.6, ox + pw, oy + ph * 0.6],
      [ox + pw * 0.38, oy + ph * 0.28, ox + pw * 0.38, oy + ph * 0.6],
      [ox + pw * 0.62, oy + ph * 0.28, ox + pw * 0.62, oy + ph * 0.6]
    ];
    walls.forEach(([x1, y1, x2, y2]) => p.line(x1, y1, x2, y2));

    p.noStroke();
    const rooms = [
      ["reading room", ox + pw * 0.03, oy + ph * 0.08],
      ["model bay", ox + pw * 0.32, oy + ph * 0.11],
      ["material lab", ox + pw * 0.78, oy + ph * 0.11],
      ["archive stacks", ox + pw * 0.04, oy + ph * 0.44],
      ["atrium void", atrium.x + atrium.w * 0.12, atrium.y + atrium.h * 0.5],
      ["catalogue desk", ox + pw * 0.78, oy + ph * 0.44],
      ["loading / service", ox + pw * 0.04, oy + ph * 0.78],
      ["projection room", ox + pw * 0.32, oy + ph * 0.78],
      ["vault", ox + pw * 0.78, oy + ph * 0.78]
    ];
    p.textSize(Math.max(8, Math.min(w, h) * 0.017));
    p.fill(18, 20, 23);
    rooms.forEach(([label, x, y]) => p.text(label, x, y));

    p.noFill();
    p.stroke(22, 78, 99);
    p.strokeWeight(2.2);
    p.beginShape();
    p.vertex(ox + pw * 0.13, oy + ph * 0.76);
    p.vertex(ox + pw * 0.13, oy + ph * 0.44);
    p.vertex(ox + pw * 0.32, oy + ph * 0.44);
    p.vertex(ox + pw * 0.32, oy + ph * 0.18);
    p.vertex(ox + pw * 0.52, oy + ph * 0.18);
    p.vertex(ox + pw * 0.52, oy + ph * 0.44);
    p.vertex(ox + pw * 0.87, oy + ph * 0.44);
    p.vertex(ox + pw * 0.87, oy + ph * 0.76);
    p.endShape();

    const door = Math.min(w, h);
    drawDoor(p, ox + pw * 0.26, oy + ph * 0.45, door * 0.052, "right");
    drawDoor(p, ox + pw * 0.38, oy + ph * 0.45, door * 0.044, "right");
    drawDoor(p, ox + pw * 0.62, oy + ph * 0.45, door * 0.044, "left");
    drawDoor(p, ox + pw * 0.74, oy + ph * 0.45, door * 0.052, "left");
    drawDoor(p, ox + pw * 0.5, oy + ph, door * 0.062, "up");

    p.stroke(200, 92, 54);
    p.strokeWeight(2.4);
    p.line(ox + pw * 0.08, oy + ph * 0.18, ox + pw * 0.92, oy + ph * 0.82);
    p.noStroke();
    p.fill(200, 92, 54);
    p.textSize(Math.max(9, Math.min(w, h) * 0.018));
    p.text("SECTION A", ox + pw * 0.08, oy + ph * 0.15);
    p.text("A", ox + pw * 0.93, oy + ph * 0.86);

    p.stroke(107, 99, 216);
    p.strokeWeight(1.8);
    for (let i = 0; i < 8; i += 1) {
      const x = ox + pw * 0.8 + i * w * 0.012;
      p.line(x, oy + ph * 0.67, x + w * 0.035, oy + ph * 0.88);
    }

    p.stroke(18, 20, 23);
    p.strokeWeight(1.3);
    p.line(w * 0.84, h * 0.2, w * 0.84, h * 0.36);
    p.line(w * 0.84, h * 0.2, w * 0.81, h * 0.25);
    p.line(w * 0.84, h * 0.2, w * 0.87, h * 0.25);
    p.noStroke();
    p.fill(18, 20, 23);
    p.textSize(Math.max(10, Math.min(w, h) * 0.016));
    p.text("N", w * 0.83, h * 0.18);
    p.text("0  5m  10m", w * 0.82, h * 0.82);
    p.stroke(18, 20, 23);
    p.line(w * 0.82, h * 0.84, w * 0.92, h * 0.84);
    p.line(w * 0.82, h * 0.835, w * 0.82, h * 0.855);
    p.line(w * 0.87, h * 0.835, w * 0.87, h * 0.855);
    p.line(w * 0.92, h * 0.835, w * 0.92, h * 0.855);
  };
}

function labelSieveSketch(p) {
  let container;
  let particles = [];
  const labels = ["entry", "door", "stair", "wall", "section", "atrium", "vault", "beam", "void", "shelf"];

  function makeParticles() {
    const random = seededRandom(1207);
    particles = Array.from({ length: 58 }, (_, index) => ({
      x: random() * p.width,
      y: random() * p.height,
      speed: 0.32 + random() * 0.88,
      drift: 0.5 + random() * 1.9,
      label: labels[index % labels.length],
      shelf: String.fromCharCode(65 + (index % 6)) + "-" + String(10 + Math.floor(random() * 89)),
      phase: random() * Math.PI * 2,
      kind: index % 4
    }));
  }

  function fit() {
    if (!container) return;
    const { width, height } = getSketchSize(container);
    p.resizeCanvas(width, height);
    makeParticles();
  }

  p.setup = function setup() {
    container = document.getElementById("p5-index-drift");
    const { width, height } = getSketchSize(container);
    const canvas = p.createCanvas(width, height);
    canvas.parent(container);
    p.pixelDensity(Math.min(window.devicePixelRatio, 2));
    makeParticles();
  };

  p.windowResized = fit;

  p.draw = function draw() {
    drawArchiveGround(p);
    const w = p.width;
    const h = p.height;
    const t = p.millis() * 0.001;

    p.noFill();
    p.stroke(18, 20, 23);
    p.strokeWeight(2);
    p.rect(w * 0.045, h * 0.08, w * 0.91, h * 0.82);

    p.noStroke();
    p.fill(22, 78, 99);
    p.textFont("Arial");
    p.textSize(Math.max(21, w * 0.034));
    p.text("Index Drift", w * 0.07, h * 0.16);

    const planX = w * 0.18;
    const planY = h * 0.28;
    const planW = w * 0.62;
    const planH = h * 0.44;
    p.stroke(18, 20, 23, 120);
    p.strokeWeight(2);
    p.noFill();
    p.rect(planX, planY, planW, planH);
    p.line(planX + planW * 0.28, planY, planX + planW * 0.28, planY + planH);
    p.line(planX + planW * 0.72, planY, planX + planW * 0.72, planY + planH);
    p.line(planX, planY + planH * 0.48, planX + planW, planY + planH * 0.48);
    p.rect(planX + planW * 0.42, planY + planH * 0.28, planW * 0.18, planH * 0.28);

    const inside = p.mouseX >= 0 && p.mouseX <= w && p.mouseY >= 0 && p.mouseY <= h;
    const lensX = inside ? p.mouseX : w * (0.52 + Math.sin(t * 0.66) * 0.26);
    const lensY = inside ? p.mouseY : h * (0.53 + Math.cos(t * 0.58) * 0.16);
    const lensR = Math.min(w, h) * 0.16;

    particles.forEach((particle) => {
      particle.y += particle.speed;
      particle.x += Math.sin(t * particle.drift + particle.phase) * 0.28;
      if (particle.y > h * 0.86) {
        particle.y = h * 0.14;
        particle.x = ((particle.x + w * 0.41) % (w * 0.78)) + w * 0.1;
      }

      const distance = p.dist(particle.x, particle.y, lensX, lensY);
      const selected = distance < lensR;
      p.noFill();
      p.strokeWeight(selected ? 2.2 : 1);
      p.stroke(selected ? 200 : 18, selected ? 92 : 20, selected ? 54 : 23, selected ? 240 : 110);
      if (particle.kind === 0) {
        p.rect(particle.x - 8, particle.y - 5, 16, 10);
      } else if (particle.kind === 1) {
        p.arc(particle.x, particle.y, 18, 18, 0, p.HALF_PI);
        p.line(particle.x, particle.y, particle.x + 9, particle.y);
      } else if (particle.kind === 2) {
        p.line(particle.x - 9, particle.y, particle.x + 9, particle.y);
        p.line(particle.x - 5, particle.y + 6, particle.x + 5, particle.y - 6);
      } else {
        p.line(particle.x - 8, particle.y, particle.x + 8, particle.y);
        p.line(particle.x, particle.y - 8, particle.x, particle.y + 8);
      }

      if (selected) {
        p.noStroke();
        p.fill(200, 92, 54);
        p.circle(particle.x, particle.y, 7);
        p.fill(18, 20, 23);
        p.textSize(Math.max(10, w * 0.012));
        p.textAlign(p.LEFT, p.CENTER);
        p.text(`${particle.label} / ${particle.shelf}`, particle.x + 11, particle.y - 2);
      }
    });

    p.noFill();
    p.stroke(107, 99, 216);
    p.strokeWeight(2);
    p.circle(lensX, lensY, lensR * 2);
    p.line(lensX - lensR * 0.7, lensY, lensX + lensR * 0.7, lensY);
    p.line(lensX, lensY - lensR * 0.7, lensX, lensY + lensR * 0.7);

    p.noStroke();
    p.fill(107, 99, 216);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(Math.max(10, w * 0.012));
    p.text("ARCHIVE LENS", lensX + lensR * 0.52, lensY - lensR * 0.75);

    p.fill(18, 20, 23);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text("rooms", w * 0.08, h * 0.28);
    p.text("doors", w * 0.08, h * 0.43);
    p.text("structure", w * 0.08, h * 0.58);
    p.text("circulation", w * 0.08, h * 0.73);
  };
}

function setupP5() {
  if (!window.p5) return;
  new window.p5(staticSectionSketch);
  new window.p5(labelSieveSketch);
}

setupArchiveAtrium();
setupFogArchive();
animateThree();
setupP5();
