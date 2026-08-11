# Style and Design System

## Intent

Digital Object Atlas is an editorial frame around seven visually independent
assignments. Consistency belongs to the frame: navigation, numbering, context,
spacing, typography, and documentation. It must not be imposed on the work
inside an embedded assignment.

The guiding contrast is **quiet index / expressive object**. The outer page
should feel deliberate enough to be a project of its own, but restrained
enough that a visitor can immediately distinguish atlas context from original
assignment content.

## Non-negotiable preservation boundary

The three directories under `public/assignments/` contain exact copies of
previous submissions. Their HTML, CSS, JavaScript, data, and local assets are
preservation material.

Atlas styling must therefore follow these rules:

- Apply shared styling only through `app/globals.css`.
- Keep each original assignment inside its own `iframe`.
- Do not inject CSS, scripts, controls, labels, overlays, or rewritten content
  into an assignment document.
- Do not normalize type, color, canvas size, interaction, or mobile behavior
  inside an assignment.
- Add context outside the embedded frame when clarification is necessary.

This boundary is both a technical decision and an authorship decision: the
final index documents previous work without silently revising its evidence.

## Ordered design priorities

### 01 — Orientation

Visitors should understand the collection before they interact with it.

- Use object numbers `01–07` everywhere sequence matters.
- Name the structure type before the individual title.
- Keep the opening index scannable and link each row to its object anchor.
- Repeat the same context order for every object: statement, material/data,
  interaction, reference, tags, and original submission.
- Preserve a clear top-to-bottom reading path even when embeds are long.

### 02 — Preservation

The shared frame should clarify differences rather than erase them.

- Present the original source directly, not a screenshot or recreation.
- Keep assignment dimensions generous enough for meaningful interaction.
- Separate atlas text from embedded work with a dark mounting field and a
  compact status bar.
- Describe what the assignment attempted without introducing a new claim.

### 03 — Restraint

The interface uses a small set of repeatable editorial moves.

- Prefer borders, alignment, and whitespace over decorative containers.
- Use one saturated accent color and reserve it for hierarchy and interaction.
- Avoid gradients, shadows, rounded cards, or animation that competes with the
  original canvases.
- Keep labels compact; let titles and embedded work hold visual emphasis.

## Visual tokens

The active tokens live in `app/globals.css`.

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#f4f1e8` | Primary atlas background; warm rather than screen-white |
| White | `#fbfaf6` | Reading surfaces and object context |
| Ink | `#171815` | Primary text, rules, dark index, and action blocks |
| Muted | `#696a63` | Secondary metadata and labels |
| Blue | `#2848d5` | Ordered numbers, emphasis, selection, and focus feedback |
| Footer wash | `#dfe4f9` | Low-intensity closing field |

Rules use either solid ink or translucent ink. This creates structure without
adding a separate card language.

## Typography

Three system-first families create a clear information hierarchy without a
font download:

- **Display serif:** Georgia / Times New Roman for the hero and major object
  titles. Tight leading and negative tracking give the atlas an editorial,
  catalogue-like voice.
- **Sans serif:** Helvetica Neue / Helvetica / Arial for statements and body
  copy. It remains neutral beside the distinct styles inside the embeds.
- **Monospace:** SFMono-Regular / Consolas / Liberation Mono for eyebrow text,
  indices, facts, tags, and embed status. Uppercase treatment makes these read
  as cataloguing metadata rather than prose.

Avoid adding a fourth type family. If the system stacks change, keep the
display/body/metadata roles intact.

## Layout and spacing

- The opening view uses a two-column split: editorial statement on paper and a
  dark object index.
- Major sections are separated by full-width one-pixel rules.
- The design-priority section uses a three-column sequence to make hierarchy
  explicit.
- Each object uses a narrow vertical number rail, a context block, and a
  full-width original-assignment frame.
- Spacing uses responsive `clamp()` values so the desktop composition can
  compress without creating an alternate visual identity.
- Embedded frames are intentionally tall (`660–920px` on larger screens) so
  the assignments function as projects, not thumbnails.

## Interaction language

Atlas interactions are intentionally simple:

- Smooth in-page navigation connects the object index to anchors.
- The primary action changes from ink to blue on hover.
- Index rows shift slightly and change color on hover.
- Keyboard focus uses a visible three-pixel blue outline with offset.
- Assignment-specific interaction remains inside the assignment frame.

Do not add global scroll effects, cursor replacement, autoplay media, or
transition-heavy reveals. Motion belongs primarily to the original work.

## Responsive behavior

At narrower widths:

- The hero changes from two columns to a vertical sequence.
- Design priorities stack from three columns to one.
- Object facts stack while retaining their dividing rules.
- Number rails become narrower but remain visible.
- Embed bars keep both status labels, with reduced type size.
- Embedded frames maintain interaction space instead of collapsing into small
  previews.

The wrapper is responsive; preserved assignments retain the responsive
behavior they had when submitted.

## Accessibility conventions

- Maintain semantic section headings in descending order.
- Give every embedded assignment a specific `title`.
- Preserve visible keyboard focus and reduced-motion support.
- Never communicate the object number or state with color alone.
- Keep body copy at a readable line height and constrain long measures.
- Treat iframe content as a separate document; accessibility improvements to
  the atlas cannot be presented as changes to the original source.

## Editorial voice

Context statements should be specific, plain, and evidence-based.

- Start with what the exercise attempts to do.
- Name the dataset or state that no external dataset is used.
- Describe actual interactions as actions: move, drag, scroll, hover, vote,
  ask.
- Distinguish measured relationships from interpretation.
- Keep ethical and provenance notes close to the object they qualify.
- Do not advertise an external integration as live unless it has been tested in
  the deployed environment.

## Change checklist

Before accepting a visual change, confirm:

- Does it improve orientation across at least two objects?
- Is it applied only to the atlas layer?
- Does the collection remain readable without an external service?
- Are keyboard focus and reduced-motion behavior preserved?
- Does the change support the ordered priorities rather than adding a new
  decorative system?
