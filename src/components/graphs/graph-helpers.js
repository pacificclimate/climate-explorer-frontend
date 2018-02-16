import _ from 'underscore';


function findMatchingMetadata(example, difference, meta) {
  // Given a dataset's metadata and a "difference" listing of attribute values pairs,
  // returns metadata for another dataset that:
  // - matches all attribute/value pairs in the "difference object"
  // - matches the original dataset for any attributes not in "difference"
  // (Unique_id is ignored for purposes of matching datasets.)
  //
  // Example: findMatchingMetadata(monthlyDataset, {timescale: "annual"})
  // would return the annual-resolution dataset that corresponds to a monthly one.
  // Returns only one dataset's metadata even if multiple qualify.
  var template = {};
  for(var att in example) {
    // TODO: !==
    if(att != 'unique_id' && att != 'variable_name') {
      template[att] = difference[att] ? difference[att] : example[att];
    }
  }
  return _.findWhere(meta, template);
}

function displayError(error, displayMethod) {
  if (error.response) {
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


const blankGraphSpec = {
  data: {
    columns: [],
  },
  axis: {},
};


export {
  findMatchingMetadata,
  displayError,
  noDataMessageGraphSpec,
  blankGraphSpec,
};
