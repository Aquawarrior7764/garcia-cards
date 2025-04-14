const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./multiplayer/src/index.js", // ✅ Direct path to your actual game code
  output: {
    path: path.resolve(__dirname, "../multiplayer"), // ✅ Output to the folder your HTML uses
    filename: "bundle.js"
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "../multiplayer/bundle.js")]
    }),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      filename: "multiplayer.html",            // ✅ Output HTML file
      template: "./multiplayer.html"           // ✅ Use your actual game page
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: { comments: false }
        }
      })
    ]
  }
};
