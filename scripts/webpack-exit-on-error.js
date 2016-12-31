// exit right on compilation fails
module.exports = function() {
  this.plugin("done", stats => {
    if (stats.compilation.errors && stats.compilation.errors.length) {
      setImmediate(() => {
        process.exit(1);
      });
    }
  });
};
