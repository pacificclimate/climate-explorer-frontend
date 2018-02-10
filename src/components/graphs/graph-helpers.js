import _ from 'underscore';


function findMatchingMetadata(example, difference, meta) {
  var template = {};
  for(var att in example) {
    // TODO: !==
    if(att != 'unique_id' && att != 'variable_name') {
      template[att] = difference[att] ? difference[att] : example[att];
    }
  }
  return _.findWhere(meta, template);
}

export { findMatchingMetadata };
