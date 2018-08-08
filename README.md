# Globe Map

<p>D3.js Globe Map showing worldwide meteorite landings with additional information about weight and classification. <a href="https://azdanov.github.io/globe-map/">Live</a></p>

![Globe](https://user-images.githubusercontent.com/6123841/43815024-41d26576-9ad6-11e8-9ae2-055b9b04f3ab.png)

## Tools

- [d3](https://d3js.org/) - JavaScript library for visualizing data using web standards.
- [d3-tip](https://github.com/Caged/d3-tip) - Tooltips for d3.js visualizations.
- [TopoJSON](https://github.com/topojson/topojson) - An extension of GeoJSON that encodes topology.
- [World Atlas](https://github.com/topojson/world-atlas) - Pre-built TopoJSON from Natural Earth.
- [Webpack](https://webpack.js.org/) - A bundler for JavaScript and friends.
- [Babel](https://babeljs.io/) - A compiler for writing next generation JavaScript.
- [PostCSS](https://postcss.org/) - A tool for transforming CSS with JavaScript.

## Build

- `yarn` - install dependencies.
- `yarn start` - start `webpack-serve` in development.
- `yarn build` - build for production to `dist` directory.
- `yarn deploy` - build and deploy to Github Pages.
- `yarn check` - analyze size of dependencies in the bundle.

## License

[MIT](./LICENSE)
