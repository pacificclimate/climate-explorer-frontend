import _ from 'underscore';
import {
  assignColoursByGroup, fadeSeriesByRank,
  hideSeriesInLegend, sortSeriesByRank
  } from '../../core/chart-formatters';
import { caseInsensitiveStringSearch } from '../../core/util';


function areAllPropsValid(
  { meta, model_id, variable_id, experiment }
) {
  console.log('areAllPropsValid', { meta, model_id, variable_id, experiment })
  const propValues = _.values(
    { meta, model_id, variable_id, experiment });
  return (propValues.length > 0) && propValues.every(Boolean);
}


function multiYearMeanSelected({ model_id, variable_id, experiment, meta }) {
  // Indicates whether the currently selected dataset is a multi-year-mean
  if (meta && meta.length === 0) {
    return undefined;
  }
  var selectedMetadata = _.findWhere(meta, { model_id, variable_id, experiment });
  return selectedMetadata.multi_year_mean;
}

function hasComparand(props) {
  return !_.isUndefined(props.comparandMeta);
}


function isVariableMYM(props) {
  // Indicates whether the currently selected dataset for the (primary)
  // variable is a multi-year-mean
  return multiYearMeanSelected(props);
}


function isComparandMYM({ model_id, comparand_id, experiment, comparandMeta }) {
  // Indicates whether the currently selected dataset for the (secondary)
  // comparand is a multi-year-mean
  return multiYearMeanSelected({
    model_id,
    variable_id: comparand_id,
    experiment,
    meta: comparandMeta,
  });
}


function isEnsembleLoading(props) {
  // When switching ensembles, DualDataController is sometimes rendered when
  // the primary variable has been updated to reflect the new ensemble,
  // but the comparand hasn't yet.
  // This function evaluates that condition.
  // False when there is no comparand to load!
  return hasComparand(props) &&
    props.meta.length > 0 && props.comparandMeta.length < 1;
}


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
  // Used to display any error (via `displayMethod`) generated in the
  // process of showing a graph or table, so it handles networking
  // errors thrown by axios calls and errors thrown by validators
  // and parsers, which have different formats.
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

export const loadingDataGraphSpec = noDataMessageGraphSpec('Loading data...');


function shouldLoadData(props, displayMessage) {
  // Return true iff the current state, evaluated based on `props`, indicates
  // that data should be loaded.
  // As a side effect, display the appropriate data loading message via
  // `displayMessage`.
  const tests = [
    { failCondition: p => !areAllPropsValid(p),
      message: 'Preparing to load data...' },
    { failCondition: isEnsembleLoading,
      message: 'Loading ensemble...' },
    { failCondition: p =>
        hasComparand(p) && (isVariableMYM(p) !== isComparandMYM(p)),
      message:
        'Error: Cannot compare climatologies to nominal time value datasets.' },
  ];
  for (const test of tests) {
    if (test.failCondition(props)) {
      displayMessage(test.message);
      return false;
    }
  }
  displayMessage('Loading data...');
  return true;
}

function emphasizeSeries(graph, seriesName) {
  // De-emphasizes all non-selected series in a graph specification.
  // Every data series that does not have seriesName in its name will
  // be assigned the same low-saturation colour, removed from the legend,
  // and placed on a lower z-axis.
  // Used by graphs that whose purpose is to provide context for a
  // particular dataset: (SingleTimeSliceGraph, SingleContextGraph).
  // Classify data series by which model generated them
  const makeSegmentor = function (selectedOutput, otherOutput) {
    return function(dataseries) {
      return caseInsensitiveStringSearch(dataseries[0], seriesName) ?
        selectedOutput :
        otherOutput;
    };
  };

  graph = assignColoursByGroup(graph, makeSegmentor(1, 0));
  graph = fadeSeriesByRank(graph, makeSegmentor(1, 0.35));
  graph = hideSeriesInLegend(graph, makeSegmentor(false, true));
  graph = sortSeriesByRank(graph, makeSegmentor(1, 0));

  return graph;
}

export {
  multiYearMeanSelected,
  isVariableMYM,
  isComparandMYM,
  isEnsembleLoading,
  findMatchingMetadata,
  displayError,
  noDataMessageGraphSpec,
  blankGraphSpec,
  shouldLoadData,
  emphasizeSeries,
};
