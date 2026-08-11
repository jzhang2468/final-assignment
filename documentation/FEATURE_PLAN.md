# Feature Plan

## Project goal

Publish one coherent website containing seven previously submitted digital
objects, with enough context to explain each exercise and enough separation to
preserve the assignments as they were submitted.

The final deliverable has two public destinations:

1. The deployed Digital Object Atlas website.
2. A new public GitHub repository containing the atlas and all three preserved
   assignment snapshots.

## Scope contract

### In scope

- A single numbered index for all seven required object types.
- Contextual statements for intent, data/material, interaction, and reference.
- Direct, interactive embedding of the original assignment files.
- A moderate shared style for the atlas wrapper only.
- Responsive layout, semantic structure, keyboard focus, and reduced-motion
  handling for the wrapper.
- Repository documentation for style, planning, ideas, local development, and
  data provenance.
- Production build and browser verification before publication.

### Protected scope

The contents of `public/assignments/` are exact snapshots. They are included in
the new repository but are not implementation surfaces for the atlas. No
feature in this plan authorizes changes to their content, data, interaction, or
visual design.

### Out of scope

- Redesigning or refactoring a submitted assignment.
- Merging the three original codebases into one JavaScript bundle.
- Replacing interactive work with screenshots.
- Adding repository or GitHub Pages links inside the atlas interface.
- Expanding Firebase, Mapbox, or OpenAI data collection.
- Adding authentication, accounts, comments, or new visitor tracking.

## Object integration matrix

| No. | Requirement | Source snapshot | Embed target | Status |
| --- | --- | --- | --- | --- |
| 01 | 2D spatial canvas | `spatial-canvases` | `index.html#catalogue-title` | Integrated |
| 02 | 3D spatial canvas | `spatial-canvases` | `index.html#atrium-title` | Integrated |
| 03 | Temporal structure | `temporal-structures` | `index.html` | Integrated |
| 04 | Relational structure | `relational-structure` | `index.html#network` | Integrated |
| 05 | Geospatial structure | `relational-structure` | `index.html#map-title` | Integrated |
| 06 | Engagement component | `relational-structure` | `index.html#poll-title` | Integrated; external service dependent |
| 07 | Agent | `relational-structure` | `index.html#agent-title` | Integrated; external service dependent |

The targets point to locations in the preserved documents. They do not create
seven modified copies of the assignment code.

## Completed atlas features

### Collection structure

- Full-page opening statement and seven-row object index.
- In-page anchor navigation from the index to each object.
- Explicit design-priority section: orientation, preservation, restraint.
- Repeated object template with number, type, title, context, facts, tags, and
  live source frame.
- Minimal footer with authorship and return-to-top navigation.

### Source preservation

- Three original submission trees copied into `public/assignments/`.
- iframe isolation between atlas CSS and assignment CSS.
- Direct loading of local HTML, JavaScript, CSS, CSV, and assignment assets.
- No links from the atlas interface back to the former repositories.

### Performance and resilience

- First two visual objects load eagerly; later embeds load lazily.
- Static context remains available while an external map, database, or agent
  service is unavailable.
- Local D3 library retained where it was part of the temporal submission.
- Responsive wrapper rules for desktop, tablet, and narrow screens.

## Pre-publication checklist

### Repository

- [ ] Confirm the new repository name and public visibility.
- [ ] Confirm all seven objects and all three source snapshots are tracked.
- [ ] Confirm no secret, private key, `.env` file, or credential is tracked.
- [ ] Confirm the README and `documentation/` files render correctly on GitHub.
- [ ] Confirm the default branch and deployment configuration are committed.

### Automated verification

- [ ] Run `npm install` from a clean checkout.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
- [ ] Run `npm run lint` and review every remaining warning.

### Browser verification

- [ ] Check all seven index links and the return-to-top link.
- [ ] Scroll and interact inside every embedded assignment.
- [ ] Verify both p5.js canvases and both Three.js canvases render.
- [ ] Verify temporal CSV rows and D3 hover details load.
- [ ] Verify relational timeline/network switching, dragging, zoom, pan, and
      reset behavior.
- [ ] Verify the map and architect filter in the deployment environment.
- [ ] Verify poll status, vote behavior, and aggregate counts.
- [ ] Verify agent status and response behavior without exposing a secret in
      browser source or network payloads.
- [ ] Check desktop and mobile-width layouts.
- [ ] Check keyboard focus and reduced-motion behavior.
- [ ] Confirm no atlas control links to an old GitHub repository or GitHub
      Pages assignment URL.

### Publication

- [ ] Push the verified commit to the new public GitHub repository.
- [ ] Deploy the same commit.
- [ ] Open the public site in a signed-out/private browser window.
- [ ] Open the public repository in a signed-out/private browser window.
- [ ] Confirm both URLs return successfully and are accessible without edit
      permission.
- [ ] Submit exactly those two working links.

## Definition of done

The project is complete when one public site presents all seven object types,
the new public repository contains the full atlas plus the three unmodified
submission snapshots, documentation describes the design and provenance, and
both links work for a visitor who is not signed in.

## Change protocol

1. Classify the proposed change as **atlas**, **documentation**, or
   **assignment source**.
2. Make atlas changes only in `app/` and documentation changes only in the
   repository Markdown files.
3. Reject incidental edits to assignment source. If a source replacement is
   intentional, copy a complete known submission and record its origin.
4. Run build, test, lint, and the relevant browser checks.
5. Review the diff before committing so a generated file or credential is not
   published accidentally.
