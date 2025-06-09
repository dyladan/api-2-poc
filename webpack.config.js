module.exports = {
  mode: "production",
  entry: "./build/src/index.js",
  output: {
    library: {
      type: "commonjs2",
    }
  },
};
