/* eslint-disable global-require */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssnanoPlugin = require("@intervolga/optimize-cssnano-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const devMode = process.env.NODE_ENV !== "production";
const checkMode = process.env.NODE_ENV === "check";

const config = {
  mode: devMode ? "development" : "production",
  entry: {
    bundle: ["./src/js/index.js"]
  },
  output: {
    filename: devMode ? "[name].js" : "[name].[hash].js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: devMode ? "eval-source-map" : "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.(pc|sa|sc|c)ss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1
            }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              plugins: () => [
                require("postcss-preset-env")({
                  stage: 2,
                  features: {
                    "nesting-rules": true
                  }
                })
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      hash: !devMode,
      favicon: "./src/assets/favicon.ico"
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
    })
  ]
};

if (!devMode) {
  config.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCssnanoPlugin({
        sourceMap: true,
        cssnanoOptions: {
          preset: "default"
        }
      })
    ],
    splitChunks: {
      chunks: "all"
    }
  };
}

if (checkMode) {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
