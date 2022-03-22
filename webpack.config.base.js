const path = require("path");

module.exports = {
  entry: "./src/customPromise.js",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
};
