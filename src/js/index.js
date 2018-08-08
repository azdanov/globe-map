import {
  drag,
  event,
  geoOrthographic,
  geoPath,
  max,
  scaleSqrt,
  select,
  zoom
} from "d3";
import initTip from "d3-tip";
import { feature } from "topojson";
import world from "world-atlas/world/110m.json";
import meteorites from "./meteorData";
import "../css/index.pcss";

const svg = select("#chart")
  .append("div")
  .classed("globe-container", true)
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 960 500")
  .classed("globe", true);

const metric = {
  gram: 1,
  kilogram: 1000,
  tonne: 1000000
};

const grouping = svg.append("g").classed("internal", true);
// Order is important (water before land)
const water = grouping.append("path");
const land = grouping.append("path");
const locations = grouping.append("g");

const format = mass => {
  if (mass >= metric.tonne) {
    return `${mass / metric.tonne} Tonnes`;
  }
  if (mass >= metric.kilogram) {
    return `${mass / metric.kilogram} Kilograms`;
  }
  return `${mass} Grams`;
};

const tip = initTip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(d => `${d.name} (${d.year}): ${format(d.mass)} (${d.classification})`);

grouping.call(tip);

const countries = feature(world, world.objects.countries);

const radiusValue = r => r.mass;
const radiusScale = scaleSqrt().range([0, 20]);

radiusScale.domain([0, max(meteorites, radiusValue)]);

meteorites.forEach(m => {
  // eslint-disable-next-line no-param-reassign
  m.radius = radiusScale(radiusValue(m));
});

const projection = geoOrthographic();
const path = geoPath().projection(projection);

const render = () => {
  water
    .datum({ type: "Sphere" })
    .attr("class", "water")
    .attr("d", path);

  land.attr("class", "land").attr("d", path(countries));

  meteorites.forEach(m => {
    const { point } = m;
    // eslint-disable-next-line no-param-reassign
    m.projection = path(point) ? projection(point.coordinates) : null;
  });

  const radiusCoefficient = 200;
  const k = Math.sqrt(projection.scale() / radiusCoefficient);

  const impacts = locations
    .selectAll("circle")
    .data(meteorites.filter(d => d.projection));

  impacts
    .enter()
    .append("circle")
    .classed("location", true)
    .merge(impacts)
    .attr("cx", x => x.projection[0])
    .attr("cy", y => y.projection[1])
    .attr("r", r => r.radius * k)
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
  impacts.exit().remove();
};
render();

let rotate0;
let coordinates0;

const coordinates = () => projection.rotate(rotate0).invert([event.x, event.y]);

const initialScale = projection.scale();

grouping
  .call(
    drag()
      .on("start", () => {
        rotate0 = projection.rotate();
        coordinates0 = coordinates();
      })
      .on("drag", () => {
        const coordinates1 = coordinates();
        projection.rotate([
          rotate0[0] + coordinates1[0] - coordinates0[0],
          rotate0[1] + coordinates1[1] - coordinates0[1]
        ]);
        render();
      })
      .on("end", () => {
        render();
      })
  )
  .call(
    zoom()
      .on("zoom", () => {
        projection.scale(initialScale * event.transform.k);
        render();
      })
      .on("end", () => {
        render();
      })
  );
