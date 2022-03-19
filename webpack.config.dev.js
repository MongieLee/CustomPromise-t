const base = require("./webpack.config.base.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  ...base,
  mode: "development",
  devServer: {
    port: 9527,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "CustomPromise",
      template: "./public/index.html",
    }),
  ],
};
