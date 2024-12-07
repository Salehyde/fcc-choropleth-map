const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const width = 960;
const height = 600;

const svg = d3.select("#choropleth")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

Promise.all([
  d3.json(educationURL),
  d3.json(countyURL)
]).then(([educationData, countyData]) => {
  const educationMap = new Map(educationData.map(d => [d.fips, d]));

  const path = d3.geoPath();
  const colorScale = d3.scaleThreshold()
    .domain([10, 20, 30, 40])
    .range(d3.schemeBlues[5]);

  // Extract counties from TopoJSON
  const counties = topojson.feature(countyData, countyData.objects.counties).features;

  // Draw counties
  svg.selectAll("path")
    .data(counties)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", d => {
      const education = educationMap.get(d.id);
      return education ? colorScale(education.bachelorsOrHigher) : "#ccc";
    })
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const education = educationMap.get(d.id);
      return education ? education.bachelorsOrHigher : 0;
    })
    .on("mouseover", (event, d) => {
      const education = educationMap.get(d.id);
      tooltip
        .style("visibility", "visible")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px")
        .attr("data-education", education.bachelorsOrHigher)
        .text(`${education.area_name}, ${education.state}: ${education.bachelorsOrHigher}%`);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  // Draw legend
  const legend = d3.select("#legend");

  const legendColors = colorScale.range();
  const legendDomain = colorScale.domain();

  const legendScale = d3.scaleLinear()
    .domain([legendDomain[0], legendDomain[legendDomain.length - 1]])
    .range([0, 300]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickValues(legendDomain)
    .tickFormat(d => d + "%");

  const legendSvg = legend.append("svg")
    .attr("width", 320)
    .attr("height", 50);

  legendSvg.append("g")
    .attr("transform", "translate(10, 20)")
    .call(legendAxis);

  legendColors.forEach((color, i) => {
    legendSvg.append("rect")
      .attr("x", i * 60 + 10)
      .attr("y", 0)
      .attr("width", 60)
      .attr("height", 20)
      .attr("fill", color);
  });
});
