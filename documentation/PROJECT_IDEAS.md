# Project Ideas and Research Directions

## Core idea

Digital Object Atlas treats a semester of computational exercises as a field
of related ways to organize information. Space, time, relationships,
geography, participation, and conversation are not presented as seven isolated
technical demos. They become seven structures through which an archive can be
drawn, entered, sequenced, compared, located, extended, and questioned.

The final website is therefore both a summary and a new project. Its new work
is curatorial: it establishes sequence, supplies context, makes provenance
visible, and creates one route through assignments that intentionally retain
different visual languages.

## Object-by-object project intent

### 01 — 2D spatial canvas

**Plan Catalogue / Index Drift** asks how architectural records might behave as
spatial and animated material. A coded floor plan establishes rooms,
circulation, labels, and measurement, while the catalogue field turns the
cursor into a lens that reorganizes fragments. The exercise uses p5.js and
generated geometry rather than an external dataset.

### 02 — 3D spatial canvas

**Archive Atrium / Material Vault** changes the archive from a drawing into an
environment. Procedural walls, ribs, shelves, fragments, fog, light, and camera
paths ask whether browsing can become bodily movement through a building. The
scenes use Three.js primitives and deterministic generation rather than an
external model.

### 03 — Temporal structure

**Waterfront Adaptation Timeline** makes overlap and dependency visible across
a fictional climate-adaptation process. Ten synthetic project phases allow a
viewer to compare ecological, infrastructural, architectural, energy,
research, and community work from 2026–2042. Hover detail turns duration from a
decorative bar into readable project information.

### 04 — Relational structure

**Built Across Generations** explores a measured relationship in MoMA
collection metadata: selected architects are linked when their documented
birth years are within six years. Timeline and force-network views let the same
records be read as chronology or proximity. The work explicitly avoids
mistaking a calculated link for evidence of collaboration or influence.

### 05 — Geospatial structure

**MoMA Architects as New York Landmarks** asks what changes when a collection
network is connected to physical sites. NYC Landmark Preservation Commission
footprints are filtered to architects already represented in the MoMA cohort,
creating a bridge between institutional metadata and possible fieldwork.

### 06 — Engagement component

**What Should the Atlas Collect Next?** gives the visitor one bounded editorial
decision: choose among archival images, oral histories, material timelines,
and fieldwork routes. The poll stores aggregate counts instead of identity or
free text, treating participation as a low-stakes signal rather than an excuse
to collect personal information.

### 07 — Agent

**Ask the Atlas to Think With You** frames an AI system as a research guide,
not a substitute for the visualizations. It can suggest ways to interpret a
cohort, landmark, or missing layer while the graph and source context remain
visible. A server-side function protects the OpenAI key and separates public
interface code from the model call.

## Shared questions

The collection is organized around four recurring questions:

1. **What counts as a relationship?** A corridor, time overlap, birth-year
   distance, geographic match, vote, and model response each connect things in
   a different way.
2. **What evidence supports the connection?** Generated geometry, synthetic
   schedules, museum metadata, landmark footprints, aggregate totals, and
   generated language have different levels of authority.
3. **How does interaction change interpretation?** Lens movement, orbit,
   hover, network drag, map filtering, voting, and questioning each give the
   viewer a different position in relation to the material.
4. **Where should the archive stop?** Clear provenance and low-data engagement
   keep an expanding interface from implying more knowledge than it contains.

## Data and ethics principles

- Label synthetic data as synthetic.
- Cite institutional datasets and state the derivation method.
- Keep inferred or calculated relations distinct from documented social ties.
- Collect the minimum visitor data necessary for an interaction.
- Keep API secrets server-side and out of public source.
- Let external-service failure degrade to an honest status message rather than
  invented content.
- Preserve original assignments as records of the work submitted at that time.

## Future ideas that preserve the originals

These ideas belong to the atlas layer or documentation. None requires editing
the assignment snapshots.

### Source manifest

Add a machine-readable manifest recording each snapshot's source repository,
commit identifier, import date, file list, and checksums. This would make the
preservation claim independently verifiable without displaying repository
links in the public interface.

### Object metadata file

Move atlas-only titles, statements, tags, credits, and embed targets into a
typed JSON or TypeScript data file. The page could then render the index and
object sections from one explicit content source while original projects remain
untouched.

### Accessibility companion

Add optional atlas-level text transcripts or static descriptions for canvas
and network behavior. These would sit beside each iframe and be clearly marked
as companion documentation, not retroactive changes to the submission.

### Service-status notes

Add concise atlas-level notices for the Mapbox, Firebase, and agent components
when their external services are unavailable. The notice should report status
only; it should never obscure or rewrite the original interface.

### Research trail

Create a small methodology page that traces how the same architect moves from
MoMA metadata to birth-cohort link to landmark footprint. A three-step example
could make cross-dataset matching legible without suggesting undocumented
causality.

### Release archive

Tag each published atlas version and generate a checksum report for preserved
source directories. This would create a clear distinction between changes to
the curatorial wrapper and intentional replacement of a complete source
snapshot.

## Ideas intentionally deferred

- A global theme toggle is deferred because it would add a second atlas style
  without improving the seven objects.
- Cross-iframe controls are deferred because they would couple the atlas to
  original assignment internals.
- Visitor accounts and saved histories are deferred because they expand data
  collection without serving the assignment requirements.
- Additional analytics are deferred unless there is a specific, disclosed
  research question and a minimal-data implementation.
- AI-generated summaries of every object are deferred because the authored
  contextual statements provide clearer provenance.

## Evaluation question

The project succeeds if a first-time visitor can identify all seven required
objects, understand what each exercise attempted, interact with the original
work, and recognize which claims come from generated material, synthetic data,
institutional metadata, visitor participation, or an AI response.
