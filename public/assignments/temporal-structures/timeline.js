const canvas = d3.select("#d3-canvas");
const tooltip = canvas.append("div").attr("class", "tooltip");

const colors = {
  Community: "#d94132",
  Research: "#6d5aa7",
  Ecology: "#3f7b58",
  Infrastructure: "#087d8d",
  Architecture: "#2f5f9f",
  Energy: "#a97514"
};

const margin = { top: 42, right: 42, bottom: 74, left: 250 };
const outerWidth = 1060;
const outerHeight = 590;
const width = outerWidth - margin.left - margin.right;
const height = outerHeight - margin.top - margin.bottom;

const svg = canvas
  .append("svg")
  .attr("viewBox", `0 0 ${outerWidth} ${outerHeight}`)
  .attr("role", "img")
  .attr("aria-label", "A D3 timeline showing synthetic waterfront adaptation phases from 2026 to 2042.");

const chart = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("events.csv", d3.autoType).then((data) => {
  data.sort((a, b) => d3.ascending(a.start, b.start) || d3.ascending(a.end, b.end));

  const x = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.start) - 0.4, d3.max(data, (d) => d.end) + 0.4])
    .range([0, width]);

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, height])
    .paddingInner(0.28)
    .paddingOuter(0.16);

  const span = x.domain()[1] - x.domain()[0];
  const tickStep = span <= 25 ? 2 : 10;
  const tickStart = Math.ceil(x.domain()[0] / tickStep) * tickStep;
  const tickEnd = Math.floor(x.domain()[1] / tickStep) * tickStep;
  const tickValues = d3.range(tickStart, tickEnd + 1, tickStep);

  const xAxis = d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.format("d"));

  chart
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickValues(tickValues).tickSize(-height).tickFormat(""))
    .call((g) => g.select(".domain").remove());

  chart
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .call((g) => g.select(".domain").attr("stroke-width", 1.4));

  chart
    .append("text")
    .attr("x", width)
    .attr("y", height + 48)
    .attr("text-anchor", "end")
    .attr("fill", "#6b6d70")
    .attr("font-size", 12)
    .attr("font-weight", 700)
    .text("YEAR");

  const rows = chart
    .selectAll(".phase-row")
    .data(data)
    .join("g")
    .attr("class", "phase-row")
    .attr("transform", (d) => `translate(0, ${y(d.name)})`);

  rows
    .append("text")
    .attr("class", "phase-label")
    .attr("x", -18)
    .attr("y", y.bandwidth() / 2 - 7)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "central")
    .text((d) => d.name);

  rows
    .append("text")
    .attr("class", "category-label")
    .attr("x", -18)
    .attr("y", y.bandwidth() / 2 + 10)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "central")
    .text((d) => d.category);

  rows
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y.bandwidth() / 2)
    .attr("y2", y.bandwidth() / 2)
    .attr("stroke", "#ece5d8")
    .attr("stroke-width", 1);

  rows
    .append("rect")
    .attr("class", "phase-bar")
    .attr("x", (d) => x(d.start))
    .attr("y", 0)
    .attr("width", (d) => x(d.end) - x(d.start))
    .attr("height", y.bandwidth())
    .attr("rx", 0)
    .attr("fill", (d) => colors[d.category] || "#6b6d70")
    .attr("opacity", 0.86)
    .on("pointerenter", function (event, d) {
      d3.select(this).attr("opacity", 1);
      tooltip
        .html(
          `<strong>${d.name}</strong>${d.start}-${d.end}<br>${d.category}<br>${d.end - d.start} year phase`
        )
        .style("opacity", 1);
      moveTooltip(event);
    })
    .on("pointermove", moveTooltip)
    .on("pointerleave", function () {
      d3.select(this).attr("opacity", 0.86);
      tooltip.style("opacity", 0);
    });

  rows
    .append("text")
    .attr("class", "phase-date")
    .attr("x", (d) => x(d.end) + 7)
    .attr("y", y.bandwidth() / 2)
    .attr("dominant-baseline", "central")
    .text((d) => `${d.start}-${d.end}`);

  const categories = Array.from(new Set(data.map((d) => d.category)));
  const legend = chart
    .append("g")
    .attr("transform", `translate(0, ${height + 34})`);

  let cursor = 0;
  categories.forEach((category) => {
    const group = legend.append("g").attr("transform", `translate(${cursor}, 0)`);
    group
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", colors[category]);
    group
      .append("text")
      .attr("x", 18)
      .attr("y", 10)
      .attr("fill", "#4d4f52")
      .attr("font-size", 12)
      .attr("font-weight", 650)
      .text(category);
    cursor += category.length * 8 + 58;
  });
});

function moveTooltip(event) {
  const bounds = canvas.node().getBoundingClientRect();
  tooltip
    .style("left", `${event.clientX - bounds.left + canvas.node().scrollLeft}px`)
    .style("top", `${event.clientY - bounds.top + canvas.node().scrollTop}px`);
}
