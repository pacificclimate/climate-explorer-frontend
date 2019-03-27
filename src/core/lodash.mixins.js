import _ from 'lodash';


const orig = _.pick(_, ['min', 'max']);

const assert = (cond, msg) => {
  console.assert(cond, msg);
  if (!cond) {
    throw new Error(msg);
  }
} ;


_.mixin({
  // Replace _.max with a version that requires an array of numbers
  'max': (a) => {
    assert(_.isArrayLike(a), '_.max(): argument is not an array');
    assert(_.every(a, _.isNumber), '_.max(): argument contains non-numbers');
    return orig.max(a);
  },

  // Replace _.min with a version that requires an array of numbers
  'min': (a) => {
    assert(_.isArrayLike(a), '_.min(): argument is not an array');
    assert(_.every(a, _.isNumber), '_.min(): argument contains non-numbers');
    return orig.min(a);
  }
});