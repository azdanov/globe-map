/* eslint-disable no-param-reassign */
import "../css/index.css";

const svg = d3.select("main svg").classed("map", true);

// Order is important (water before land)
const water = svg.append("path");
const land = svg.append("path");
const locations = svg.append("g");

const format = mass => {
    if (mass >= 10000) {
        return `${mass / 10000} Tonnes`;
    } else if (mass >= 1000) {
        return `${mass / 1000} Kilograms`;
    }
    return `${mass} Grams`;
};

const tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(d => `${d.name} (${d.year}): ${format(d.mass)} (${d.classification})`);
svg.call(tip);

d3
    .queue()
    .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
    .defer(d3.json, "https://cdn.rawgit.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json")
    .await((error, world, { features: data }) => {
        const countries = topojson.feature(world, world.objects.countries);

        const meteorites = data.map(({ geometry: point, properties: { name, recclass, year, mass } }) => ({
            name,
            point,
            mass: Number(mass),
            classification: recclass,
            year: new Date(year).getFullYear(),
        }));

        const radiusValue = d => d.mass;
        const radiusScale = d3.scaleSqrt().range([0, 20]);

        radiusScale.domain([0, d3.max(meteorites, radiusValue)]);

        meteorites.forEach(d => {
            d.radius = radiusScale(radiusValue(d));
        });

        const projection = d3.geoOrthographic();
        const geoPath = d3.geoPath().projection(projection);

        const render = () => {
            water
                .datum({ type: "Sphere" })
                .attr("class", "water")
                .attr("d", geoPath);

            land.attr("class", "land").attr("d", geoPath(countries));

            meteorites.forEach(d => {
                const { point } = d;
                d.projection = geoPath(point) ? projection(point.coordinates) : null;
            });

            const radiusCoefficient = 200;
            const k = Math.sqrt(projection.scale() / radiusCoefficient);

            const circles = locations.selectAll("circle").data(meteorites.filter(d => d.projection));

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

        const coordinates = () => projection.rotate(rotate0).invert([d3.event.x, d3.event.y]);

        const initialScale = projection.scale();

        svg
            .call(
                d3
                    .drag()
                    .on("start", () => {
                        rotate0 = projection.rotate();
                        coordinates0 = coordinates();
                    })
                    .on("drag", () => {
                        const coordinates1 = coordinates();
                        projection.rotate([
                            rotate0[0] + coordinates1[0] - coordinates0[0],
                            rotate0[1] + coordinates1[1] - coordinates0[1],
                        ]);
                        render();
                    })
                    .on("end", () => {
                        render();
                    })
            )
            .call(
                d3
                    .zoom()
                    .on("zoom", () => {
                        projection.scale(initialScale * d3.event.transform.k);
                        render();
                    })
                    .on("end", () => {
                        render();
                    })
            );
    });
