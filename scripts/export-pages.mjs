import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pagesRoot = join(projectRoot, "docs");
const sourceUrl = process.env.PAGES_SOURCE_URL ?? "http://localhost:3000/";

// The app is server-rendered, but this portfolio page has no runtime server state.
// Extracting its rendered <main> produces a small, durable GitHub Pages snapshot.
const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Could not read ${sourceUrl} (${response.status}). Start npm run dev first.`);
}

const rendered = await response.text();
const main = rendered.match(/<main>[\s\S]*<\/main>/)?.[0];
if (!main) {
  throw new Error("The rendered page did not contain a <main> element.");
}

const subpathSafeMain = main.replaceAll(
  'src="/assignments/',
  'src="./assignments/',
);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Digital Object Atlas — Jinghan Zhang</title>
    <meta name="description" content="Seven original computational design assignments presented in one public index.">
    <link rel="canonical" href="https://jzhang2468.github.io/final-assignment/">
    <link rel="icon" href="./favicon.svg">
    <script src="./initial-scroll.js"></script>
    <link rel="stylesheet" href="./style.css">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Digital Object Atlas — Jinghan Zhang">
    <meta property="og:description" content="Seven original computational design assignments presented in one public index.">
    <meta property="og:url" content="https://jzhang2468.github.io/final-assignment/">
    <meta property="og:image" content="https://jzhang2468.github.io/final-assignment/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Digital Object Atlas — Jinghan Zhang">
    <meta name="twitter:description" content="Seven original computational design assignments presented in one public index.">
    <meta name="twitter:image" content="https://jzhang2468.github.io/final-assignment/og.png">
  </head>
  <body>
    ${subpathSafeMain}
  </body>
</html>
`;

const css = (await readFile(join(projectRoot, "app", "globals.css"), "utf8"))
  .replace(/^@import "tailwindcss";\s*/u, "");

// Rebuild the deploy directory from scratch so removed or renamed assets do not
// linger in a later GitHub Pages publish.
await rm(pagesRoot, { recursive: true, force: true });
await mkdir(pagesRoot, { recursive: true });
await writeFile(join(pagesRoot, "index.html"), html);
await writeFile(join(pagesRoot, "style.css"), css);
await writeFile(join(pagesRoot, ".nojekyll"), "");
await cp(join(projectRoot, "public", "assignments"), join(pagesRoot, "assignments"), {
  recursive: true,
  force: true,
});
await copyFile(join(projectRoot, "public", "og.png"), join(pagesRoot, "og.png"));
await copyFile(join(projectRoot, "public", "favicon.svg"), join(pagesRoot, "favicon.svg"));
await copyFile(
  join(projectRoot, "public", "initial-scroll.js"),
  join(pagesRoot, "initial-scroll.js"),
);

console.log(`GitHub Pages snapshot written to ${pagesRoot}`);
