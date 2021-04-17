const path = require("path");

module.exports = {
  entry: "./src/app.ts",
  mode:'development',
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "dist"
  },
  devtool:'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,

      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
