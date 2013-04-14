module.exports = {
  ensureInt: function(input) {
    var output = parseInt(input, 10);
    if (input == output) {
      return output;
    }
    return null;
  }
};
