import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const objectIds = [
  "spatial-2d",
  "spatial-3d",
  "temporal",
  "relational",
  "geospatial",
  "engagement",
  "agent",
];

test("server-renders the complete seven-object atlas", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Digital Object Atlas — Jinghan Zhang<\/title>/i);
  assert.match(html, /Seven structures\./);
  assert.match(html, /One field/);

  for (const id of objectIds) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  assert.match(html, /assignments\/spatial-canvases\/index\.html#catalogue-title/);
  assert.match(html, /assignments\/spatial-canvases\/index\.html#atrium-title/);
  assert.match(html, /assignments\/temporal-structures\/index\.html/);
  assert.match(html, /assignments\/relational-structure\/index\.html#network/);
  assert.match(html, /assignments\/relational-structure\/index\.html#map-title/);
  assert.match(html, /assignments\/relational-structure\/index\.html#poll-title/);
  assert.match(html, /assignments\/relational-structure\/index\.html#agent-title/);
  assert.doesNotMatch(html, /github\.com\/jzhang2468|jzhang2468\.github\.io\/(Spatial|temporal|relational)/i);
});

test("ships a project-subpath-safe GitHub Pages snapshot", async () => {
  const pagesHtml = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");

  assert.match(pagesHtml, /href=["']\.\/style\.css["']/);
  assert.match(pagesHtml, /src=["']\.\/assignments\/spatial-canvases/);
  assert.match(pagesHtml, /src=["']\.\/assignments\/temporal-structures/);
  assert.match(pagesHtml, /src=["']\.\/assignments\/relational-structure/);
  assert.doesNotMatch(pagesHtml, /src=["']\/assignments\//);

  await Promise.all([
    access(new URL("../docs/.nojekyll", import.meta.url)),
    access(new URL("../docs/og.png", import.meta.url)),
    access(new URL("../docs/assignments/spatial-canvases/main.js", import.meta.url)),
    access(new URL("../docs/assignments/temporal-structures/events.csv", import.meta.url)),
    access(new URL("../docs/assignments/relational-structure/nodes.csv", import.meta.url)),
    access(new URL("../docs/assignments/relational-structure/geo-map.js", import.meta.url)),
    access(new URL("../docs/assignments/relational-structure/poll-app.js", import.meta.url)),
    access(new URL("../docs/assignments/relational-structure/chatbot-app.js", import.meta.url)),
  ]);
});
