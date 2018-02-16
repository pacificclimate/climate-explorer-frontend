// TODO: Possibly rename this module
// Functions extracted from DataControllerMixin

import _ from 'underscore';


function multiYearMeanSelected(props) {
  // Indicates whether the currently selected dataset is a multi-year-mean
  if (_.isUndefined(props) || props.meta.length === 0) {
    return undefined;
  }
  var params = _.pick(props, 'model_id', 'variable_id', 'experiment');
  var selectedMetadata = _.findWhere(props.meta, params);
  return selectedMetadata.multi_year_mean;
}


export {
  multiYearMeanSelected,
};
