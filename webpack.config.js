import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import dotenv from "dotenv-webpack";
import path from "path";
import { isDev, isProd } from "./src/helpers";

let config = {
  target: "node",
  mode: process.env.NODE_ENV,
  entry: {
    server: "./index.js"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".js"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@root": path.resolve(__dirname, ".")
    }
  },
  externals: [nodeExternals()],
  plugins: [
    new dotenv({
      path: !isProd ? path.resolve(__dirname, "./.env.development") : undefined
    })
  ],
  stats: {
    all: false,
    timings: true
  }
};

if (isDev) {
  config.devtool = "cheap-module-eval-source-map";
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

export default config;
