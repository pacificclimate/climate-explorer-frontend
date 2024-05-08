var generateResolutions = function (maxRes, count) {
  var result = new Array(count);
  for (var i = 0; i < result.length; i++) {
    result[i] = maxRes / Math.pow(2, i);
  }
  return result;
};

export { generateResolutions };
