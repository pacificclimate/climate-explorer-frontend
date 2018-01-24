import _ from 'underscore';

function shallowDiff(a, b) {
  // Compute the shallow difference between two objects `a` and `b`.
  let diff = {};
  const keys = _.union(Object.keys(a), Object.keys(b));
  for (let key of keys) {
    if (a[key] !== b[key]) {
      diff[key] = [a[key], b[key]];
    }
  }
  return diff;
}

function shallowDiffStr(a, b, space=4) {
  return JSON.stringify(shallowDiff(a, b), null, space);
}

export { shallowDiff, shallowDiffStr };
