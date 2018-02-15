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


function displayError(error, displayMethod) {
  if(error.response) {
    // axios error: data server sent a non-200 response
    displayMethod('Error: ' + error.response.status + ' received from data server.');
  } else if (error.request) {
    // axios error: data server didn't respond
    displayMethod('Error: no response received from data server.');
  } else {
    // either an error thrown by a data validation function,
    // an error thrown by the DataGraph or DataTable parsers,
    // or the generic and somewhat unhelpful 'Network Error' from axios
    // Testing turned up 'Network Error' in two cases:
    // the server is down, or the server has a 500 error.
    // Other http error statuses tested were reflected in
    // error.response.status as expected
    // (see https://github.com/mzabriskie/axios/issues/383)
    displayMethod(error.message);
  }
}

function noDataMessageGraphSpec(message) {
  return {
    data: {
      columns: [],
      empty: {
        label: {
          text: message,
        },
      },
    },
    axis: {},
  };
}

export { multiYearMeanSelected, displayError, noDataMessageGraphSpec };
