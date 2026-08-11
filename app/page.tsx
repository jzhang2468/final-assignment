type DigitalObject = {
  id: string;
  number: string;
  type: string;
  title: string;
  statement: string;
  material: string;
  interaction: string;
  reference: string;
  tags: string[];
  embedUrl: string;
};

const objects: DigitalObject[] = [
  {
    id: "spatial-2d",
    number: "01",
    type: "2D spatial canvas",
    title: "Plan Catalogue / Index Drift",
    statement:
      "A static p5.js floor plan organizes rooms around a central atrium with corridors, doors, stairs, section marks, labels, north arrow, and scale. An animated p5.js catalogue field lets the cursor act as an archival lens, pulling labels, dimensions, and drawing fragments into focus.",
    material:
      "No external dataset. Nine named plan spaces and 58 seeded fragments are generated directly in p5.js.",
    interaction:
      "Move the cursor to operate the archive lens. Outside the canvas, the lens follows an autonomous path.",
    reference:
      "The original design interest treats architectural records as inhabitable material. No external images, models, or datasets are used.",
    tags: ["p5.js", "procedural drawing", "cursor lens"],
    embedUrl: "/assignments/spatial-canvases/index.html#catalogue-title",
  },
  {
    id: "spatial-3d",
    number: "02",
    type: "3D spatial canvas",
    title: "Archive Atrium / Material Vault",
    statement:
      "Travel inside a long archive atrium with walls, beams, columns, mezzanines, stairs, shelves, light wells, and a moving camera path. Move through a foggy material vault lined with ribs, display cases, shelves, section planes, fragments, and shifting inspection light.",
    material:
      "Primitive Three.js geometry, deterministic fragments, particles, fog, structural ribs, shelves, light wells, and circulation paths.",
    interaction:
      "Drag to orbit, scroll to zoom, or let the moving camera and inspection light guide the route through both scenes.",
    reference:
      "The original design interest uses code to make fragments into rooms, labels into wayfinding, and the archive into a building that can be moved through.",
    tags: ["Three.js", "OrbitControls", "procedural space"],
    embedUrl: "/assignments/spatial-canvases/index.html#atrium-title",
  },
  {
    id: "temporal",
    number: "03",
    type: "Temporal structure",
    title: "Waterfront Adaptation Timeline",
    statement:
      "This D3 visualization adapts the class Gantt-style timeline example by changing the CSV file to a synthetic dataset. Each band marks the duration of one fictional project phase, making it possible to compare which temporal layers happen in parallel and which depend on earlier groundwork.",
    material:
      "A synthetic CSV of ten fictional ecology, infrastructure, architecture, energy, research, and community phases from 2026–2042.",
    interaction:
      "Hover across each D3 band to read its category, date span, and computed duration.",
    reference:
      "The original reflection connects this structure to Excavating AI: mapping historical layers so bias becomes visible as something accumulated through repeated classification.",
    tags: ["D3.js", "synthetic CSV", "hover detail"],
    embedUrl: "/assignments/temporal-structures/index.html",
  },
  {
    id: "relational",
    number: "04",
    type: "Relational structure",
    title: "Built Across Generations",
    statement:
      "A relational portrait of architects represented in MoMA's collection. Each line joins two people born within six years of one another. The graph does not claim collaboration, influence, mentorship, or shared style.",
    material:
      "38 architect records and 112 proximity links derived from the Museum of Modern Art collection dataset, released CC0.",
    interaction:
      "Toggle timeline and force-network views; drag nodes, zoom, pan, reset the field, and inspect individual architects.",
    reference:
      "Source: Museum of Modern Art Collection dataset, CC0. The method distinguishes measured birth-year proximity from inferred relationships.",
    tags: ["D3.js", "MoMA metadata", "force network"],
    embedUrl: "/assignments/relational-structure/index.html#network",
  },
  {
    id: "geospatial",
    number: "05",
    type: "Geospatial structure",
    title: "MoMA Architects as New York Landmarks",
    statement:
      "This map does not add a second relational diagram. It extends the existing MoMA cohort network into geography by filtering NYC Landmark Preservation Commission footprints to architects already present in the network.",
    material:
      "Ten NYC Landmarks Preservation Commission footprints filtered to six architects already present in the MoMA cohort network.",
    interaction:
      "Pan and zoom the Mapbox canvas, filter by architect, inspect landmark footprints, and refit the complete landmark set.",
    reference:
      "The original project-use statement proposes a fieldwork index in which architects, buildings, images, interviews, and observations can be mapped together.",
    tags: ["Mapbox GL", "NYC LPC", "linked datasets"],
    embedUrl: "/assignments/relational-structure/index.html#map-title",
  },
  {
    id: "engagement",
    number: "06",
    type: "Engagement component",
    title: "What Should the Atlas Collect Next?",
    statement:
      "This poll turns the project outward by asking viewers which additional layer would make the architectural network more useful as a research interface.",
    material:
      "Firebase stores anonymous aggregate totals only—no names, emails, location, or written comments.",
    interaction:
      "Vote once in the live poll and compare archival images, oral histories, material timelines, and fieldwork routes.",
    reference:
      "The original ethical note keeps the question low-stakes and stores only summed counts so engagement does not become extractive.",
    tags: ["Firebase", "aggregate votes", "privacy by design"],
    embedUrl: "/assignments/relational-structure/index.html#poll-title",
  },
  {
    id: "agent",
    number: "07",
    type: "Agent",
    title: "Ask the Atlas to Think With You",
    statement:
      "This chatbot is framed as a research guide for the relational atlas. Instead of replacing the graph, it can help a viewer ask what a cohort, landmark, or missing archive layer might mean.",
    material:
      "The browser sends a question to Firebase; a secure server function calls OpenAI so the API key never enters the public GitHub Pages code.",
    interaction:
      "Ask about cohorts, landmarks, or missing archive layers. The agent returns a concise research-oriented response.",
    reference:
      "The original project-use statement describes a conversational layer that suggests paths through the dataset, missing evidence, and future collection priorities.",
    tags: ["OpenAI", "Firebase Functions", "research guide"],
    embedUrl: "/assignments/relational-structure/index.html#agent-title",
  },
];

const priorities = [
  {
    number: "01",
    title: "Orientation",
    text: "A numbered index and repeated labels make seven different assignments easy to navigate.",
  },
  {
    number: "02",
    title: "Preservation",
    text: "Every original HTML, CSS, JavaScript, and data file is embedded unchanged from its submitted GitHub repository.",
  },
  {
    number: "03",
    title: "Restraint",
    text: "The outer page uses neutral spacing and rules so each assignment keeps its own visual identity.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Computational Design Workflows / Final Index</p>
          <h1>
            Seven structures.<br />
            <em>One field</em> of inquiry.
          </h1>
          <a className="primary-action" href="#objects">
            View the original assignments <span>↓</span>
          </a>
        </div>

        <div className="hero-index" aria-label="Seven digital objects">
          <div className="index-head">
            <span>Object</span>
            <span>Structure</span>
          </div>
          {objects.map((object) => (
            <a key={object.id} href={`#${object.id}`}>
              <span>{object.number}</span>
              <b>{object.type}</b>
              <i>↘</i>
            </a>
          ))}
          <div className="index-foot">
            <span>07 objects</span>
            <span>03 original repositories</span>
          </div>
        </div>
      </section>

      <section className="design-priorities" id="design">
        <div className="section-heading">
          <p className="eyebrow">Design system / ordered priorities</p>
          <h2>One frame. Seven original assignments.</h2>
        </div>
        <div className="priority-grid">
          {priorities.map((priority) => (
            <article key={priority.number}>
              <span>{priority.number}</span>
              <h3>{priority.title}</h3>
              <p>{priority.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="object-collection" id="objects">
        <div className="collection-intro">
          <p className="eyebrow">The collection / 01—07</p>
          <p>
            The panels below run the exact submitted project files directly inside
            this website. Scroll and interact within each panel.
          </p>
        </div>

        {objects.map((object, index) => (
          <article className="object-card" id={object.id} key={object.id}>
            <div className="object-number" aria-hidden="true">
              {object.number}
            </div>
            <div className="object-copy">
              <p className="object-type">{object.type}</p>
              <h2>{object.title}</h2>
              <p className="object-statement">{object.statement}</p>

              <div className="object-facts">
                <div>
                  <span>Material / data</span>
                  <p>{object.material}</p>
                </div>
                <div>
                  <span>Interaction</span>
                  <p>{object.interaction}</p>
                </div>
                <div>
                  <span>Reference</span>
                  <p>{object.reference}</p>
                </div>
              </div>

              <div className="tag-row">
                {object.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

            </div>

            <div className="original-assignment">
              <div className="embed-bar">
                <span>Original submission / embedded unchanged</span>
                <span>Runs directly on this page</span>
              </div>
              <iframe
                src={object.embedUrl}
                title={`${object.title} — original submitted assignment`}
                loading={index < 2 ? "eager" : "lazy"}
                allow="fullscreen"
              />
            </div>
          </article>
        ))}
      </section>

      <footer>
        <p>Jinghan Zhang / 2026</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
