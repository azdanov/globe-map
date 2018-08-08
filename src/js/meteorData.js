import meteoriteData from "../assets/meteorite-strike-data.json";

export default meteoriteData.features.map(
  ({ geometry: point, properties: { name, recclass, year, mass } }) => ({
    point,
    name,
    classification: recclass,
    year: new Date(year).getFullYear(),
    mass: Number(mass)
  })
);
