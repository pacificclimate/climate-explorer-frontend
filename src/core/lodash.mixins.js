import _ from 'lodash';


const orig = _.pick(_, ['min', 'max']);

const assert = (cond, msg) => {
  console.assert(cond, msg);
  if (!cond) {
    throw new Error(msg);
  }
} ;


_.mixin({
  // Replace _.max with a version that requires numeric arguments
  'max': (a) => {
    assert(_.every(a, _.isNumber), '_.max(): argument contains non-numbers');
    return orig.max(a);
  },

  // Replace _.min with a version that requires numeric arguments
  'min': (a) => {
    assert(_.every(a, _.isNumber), '_.min(): argument contains non-numbers');
    return orig.min(a);
  }
});
