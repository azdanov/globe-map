import { max } from "d3-array";
import { drag } from "d3-drag";
import { geoOrthographic, geoPath } from "d3-geo";
import { scaleSqrt } from "d3-scale";
import { event, select } from "d3-selection";
import d3Tip from "d3-tip";
import { zoom } from "d3-zoom";
import { feature } from "topojson";
import world from "../../node_modules/world-atlas/world/110m.json";
import meteoriteData from "../assets/meteorite-strike-data.json";
import "../css/index.css";

const svg = select("main svg").classed("map", true);

const metricWeight = new function metricWeight() {
  this.gram = 1;
  this.kilogram = this.gram * 1000;
  this.tonne = this.kilogram * 1000;
}();

// Order is important (water before land)
const water = svg.append("path");
const land = svg.append("path");
const locations = svg.append("g");

const format = mass => {
  if (mass >= metricWeight.tonne) {
    return `${mass / metricWeight.tonne} Tonnes`;
  }
  if (mass >= metricWeight.kilogram) {
    return `${mass / metricWeight.kilogram} Kilograms`;
  }
  return `${mass} Grams`;
};

const tip = d3Tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(d => `${d.name} (${d.year}): ${format(d.mass)} (${d.classification})`);

svg.call(tip);

const countries = feature(world, world.objects.countries);

const meteorites = meteoriteData.features.map(
  ({ geometry: point, properties: { name, recclass, year, mass } }) => ({
    name,
    point,
    mass: Number(mass),
    classification: recclass,
    year: new Date(year).getFullYear()
  })
);

const radiusValue = d => d.mass;
const radiusScale = scaleSqrt().range([0, 20]);

radiusScale.domain([0, max(meteorites, radiusValue)]);

meteorites.forEach(d => {
  // eslint-disable-next-line no-param-reassign
  d.radius = radiusScale(radiusValue(d));
});

const projection = geoOrthographic();
const path = geoPath().projection(projection);

const render = () => {
  water
    .datum({ type: "Sphere" })
    .attr("class", "water")
    .attr("d", path);

  land.attr("class", "land").attr("d", path(countries));

  meteorites.forEach(d => {
    const { point } = d;
    // eslint-disable-next-line no-param-reassign
    d.projection = path(point) ? projection(point.coordinates) : null;
  });

  const radiusCoefficient = 200;
  const k = Math.sqrt(projection.scale() / radiusCoefficient);

  const circles = locations
    .selectAll("circle")
    .data(meteorites.filter(d => d.projection));

  circles
    .enter()
    .append("circle")
    .classed("location", true)
    .merge(circles)
    .attr("cx", d => d.projection[0])
    .attr("cy", d => d.projection[1])
    .attr("r", d => d.radius * k)
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
  circles.exit().remove();
};
render();

let rotate0;
let coordinates0;

const coordinates = () => projection.rotate(rotate0).invert([event.x, event.y]);

const initialScale = projection.scale();

svg
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
