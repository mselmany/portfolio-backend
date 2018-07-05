import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import path from "path";

export default {
  target: "node",
  mode: "development",
  devtool: "sourcemap",
  entry: {
    server: "./index.js"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".js"]
  },
  externals: [nodeExternals()],
  plugins: [new webpack.HotModuleReplacementPlugin()]
};
