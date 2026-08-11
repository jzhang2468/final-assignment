# Digital Object Atlas

Digital Object Atlas is the final index for seven digital objects created in
Computational Design Workflows. It brings the previously submitted assignments
into one navigable website while keeping the content, data, interactions, and
visual design of each original submission intact.

The project has two distinct layers:

- The **atlas layer** provides a shared introduction, numbered navigation,
  contextual statements, metadata, and a consistent reading structure.
- The **assignment layer** runs exact copies of the submitted project files in
  isolated embedded frames. Each assignment retains its own code, dependencies,
  dataset, interaction model, and visual identity.

## Seven digital objects

| No. | Object | Original study | Data and interaction |
| --- | --- | --- | --- |
| 01 | 2D spatial canvas | **Plan Catalogue / Index Drift** | p5.js architectural drawing and a cursor-controlled archival lens; nine named spaces and 58 deterministic fragments are generated in code. |
| 02 | 3D spatial canvas | **Archive Atrium / Material Vault** | Three.js procedural architecture with orbit, zoom, animated camera movement, fog, light, and generated fragments. |
| 03 | Temporal structure | **Waterfront Adaptation Timeline** | D3.js Gantt-style timeline using a synthetic CSV of ten fictional phases from 2026–2042; hover reveals category, dates, and duration. |
| 04 | Relational structure | **Built Across Generations** | D3.js timeline and force-network views derived from 38 MoMA architect records and 112 birth-year-proximity links; nodes can be inspected and dragged. |
| 05 | Geospatial structure | **MoMA Architects as New York Landmarks** | Mapbox view of ten NYC Landmark Preservation Commission footprints filtered to six architects in the MoMA network. |
| 06 | Engagement component | **What Should the Atlas Collect Next?** | Firebase-backed poll that stores anonymous aggregate totals for four possible archival layers. |
| 07 | Agent | **Ask the Atlas to Think With You** | Research-guide interface that sends questions through a secure Firebase Function to OpenAI; the API key remains server-side. |

The relational links represent documented birth-year proximity only. They do
not claim collaboration, influence, mentorship, or stylistic similarity.

## Preservation rule

Everything under `public/assignments/` is an exact source snapshot of a
previously submitted assignment. Do not restyle, rewrite, refactor, or repair a
file inside these directories as part of atlas development:

```text
public/assignments/
├── spatial-canvases/
├── temporal-structures/
└── relational-structure/
```

The atlas may change only the surrounding React page and its documentation.
If an original submission must ever be updated, replace its full snapshot from
the source repository and document that replacement; do not make an untracked
one-off edit inside the copy.

## Design priorities

1. **Orientation** — a numbered index, repeated object labels, and in-page
   anchors make seven different structures easy to navigate.
2. **Preservation** — the atlas explains each work without flattening the
   assignments into a new house style.
3. **Restraint** — a paper-toned editorial frame, strong rules, serif display
   type, compact monospace labels, and one blue accent support the work rather
   than competing with it.

The complete visual system is documented in
[`documentation/STYLE.md`](documentation/STYLE.md).

## Run locally

### Requirements

- Node.js `>=22.13.0`
- npm

### Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`. The assignment files must be served through the
development server; opening their HTML files directly will break CSV loading
and other browser features that require HTTP.

### Verification

```bash
npm run build
npm test
npm run lint
npm run export:pages
```

`npm test` performs a production build before running the rendered-HTML test.
Interactive canvas, map, Firebase, and agent behavior should also be checked in
a browser because those experiences cannot be fully covered by the HTML test.
`npm run export:pages` refreshes the project-subpath-safe static site in
`docs/`, which is the directory published by GitHub Pages.

## Repository structure

```text
.
├── app/
│   ├── layout.tsx             # document shell and metadata
│   ├── page.tsx               # object metadata, context, and embedded panels
│   └── globals.css            # atlas-only visual system and responsive rules
├── documentation/
│   ├── STYLE.md               # visual and editorial decisions
│   ├── FEATURE_PLAN.md        # scope, status, and release checklist
│   └── PROJECT_IDEAS.md       # concept, research directions, and future ideas
├── docs/                      # generated static GitHub Pages site
├── public/assignments/        # preserved original assignment snapshots
│   ├── spatial-canvases/
│   ├── temporal-structures/
│   └── relational-structure/
├── tests/                     # production-render checks
├── package.json               # local development and verification commands
└── vite.config.ts             # vinext development/build configuration
```

## How the embedding works

The atlas treats seven ideas as seven objects even though they originate in
three submitted websites. `app/page.tsx` stores the context and embed location
for each object. The spatial and relational websites are reused at specific
HTML anchors; the temporal website is embedded as a complete page. Each URL is
loaded in an `iframe`, so the original CSS and JavaScript do not inherit atlas
styles.

External-service features retain the behavior of their original submissions:
Mapbox needs its configured map access, the poll needs Firebase Realtime
Database, and the agent needs its deployed Firebase Function and server-side
OpenAI secret. The rest of the atlas remains readable if an external service is
temporarily unavailable.

## Project documentation

- [Style and design system](documentation/STYLE.md)
- [Feature plan and release checklist](documentation/FEATURE_PLAN.md)
- [Project ideas and research directions](documentation/PROJECT_IDEAS.md)

## Credits and data provenance

- Spatial canvases: p5.js and Three.js; no external image, model, or research
  dataset is used.
- Temporal structure: a synthetic waterfront adaptation dataset created for
  the assignment.
- Relational structure: derived from the Museum of Modern Art Collection
  dataset, published as CC0 metadata.
- Geospatial structure: NYC Landmark Preservation Commission building
  footprints filtered to architects represented in the relational cohort.

Created by Jinghan Zhang, 2026.
