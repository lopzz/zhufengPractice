const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  context: process.cwd(),
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "monitor.js",
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      const { app } = devServer;

      app.get("/success", function (req, res) {
        res.json({ id: 1 });
      });

      app.post("/error", function (req, res) {
        res.sendStatus(500);
      });

      return middlewares;
    },
  },
  module: {},
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index2.html",
      inject: "head",
    }),
  ],
};
