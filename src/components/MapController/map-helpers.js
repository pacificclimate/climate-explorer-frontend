/************************************************************************
 * map-helpers.js - helper functions for MapControllers
 * 
 * Functions in this file fall into two general categories:
 * 
 *   0. Data processing helper functions, which extract information from
 *      a MapController props object or piece of one.
 *   
 *   1. WMS parameter generation functions, which generate initial 
 *      parameters for ncWMS layers of various types.
 ************************************************************************/
import _ from 'underscore';

import { getTimeMetadata } from '../../data-services/ce-backend';
import { getVariableOptions } from '../../core/util';

/************************************************************************
 * 0. Data processing helpers
 ************************************************************************/

function hasValidData(symbol, props) {
  // Returns true if props contains enough information to generate a map
  // for the primary (symbol is 'variable') or secondary ('comparand') variable.
  var dataLocation = symbol === 'variable' ? 'meta' : 'comparandMeta';

  return !_.isUndefined(props[dataLocation]) &&
    props[dataLocation].length > 0;
}

function hasComparand(props) {
  return this.hasValidData('comparand', props);
}

function selectedVariable(meta) {
  // from an array of dataset meta filtered by variable, returns the active variable
  // returns 'undefined' for empty arrays and arrays containing multiple variables.
  var variables = _.uniq(_.pluck(meta, 'variable_id'));
  return variables.length === 1 ? variables[0] : undefined;
  }

// predicate that detects whether a timestamp index is a 0th index:
// either January, winter, or the first year in a file. 
const is0thIndex = timestamp => (JSON.parse(timestamp).timeidx == 0);

/********************************************************************
 * 1. WMS parameter generating functions
 ********************************************************************/

function getTimesPromise(datafiles) {
  // Get a promise for an indexed list of all timestamps available in the 
  // selected datafiles. The indices are stringified objects with timescale
  // and timeidx attributes, for example, for a climatological mean:
  //   {timescale: monthly, timeidx: 0} is January.
  //   {timescale: seasonal, timeidx: 2} is Summer
  // For a nominal-time dataset, the indices would look like:
  //   {timescale: annual, timeidx: 0} is 1950
  //   {timescale: annual, timeidx: 1} is 1951
  // The timestamps are timestamp strings suitable for ncWMS.
  const timestampPromises = datafiles.map(df => getTimeMetadata(df.unique_id));
  
  return Promise.all(timestampPromises).then(responses => {
    let times = {};

    for (let i = 0; i < responses.length; i++) {
      let id = Object.keys(responses[i].data)[0];
      for (let timeidx in responses[i].data[id].times) {
        var idxString = JSON.stringify({
          timescale: responses[i].data[id].timescale,
          timeidx,
        });

        // This assumes only one variable per file.
        times[idxString] = responses[i].data[id].times[timeidx];
      }
    }
    return times;
  });
}

function getScalarParamsPromise(instance, meta) {
  // return a promise for an object containing initial parameters common to
  // all scalar WMS layers (raster, isoline, annotated isoline):
  //   * variableId (name of displayed variable)
  //   * times (list of all available times)
  //   * timeIdx (the index of a selected starting time)
  //   * wmsTime (the actual timestamp of the selected starting time)
  //   * logscale (boolean string, 'true' meaning logarithmic colour scaling)
  //   * range (empty object, as ncWMS won't have been queried yet)
  // for this particular instance (start date + end date + run)
  // These are default parameters, not based on user selection or MapController
  // state, and will likely need to be tweaked by the calling MapController.
  const { start_date, end_date, ensemble_member } = instance;
  const variableId = selectedVariable(meta);
  const logscale = "false"; 
  
  let datafiles = _.filter(meta,
      { ensemble_member, start_date, end_date });
  
  return getTimesPromise(datafiles).then(times => {
    //select a 0th index to display initially.
    const startingIndex = _.find(Object.keys(times), is0thIndex);
    return {variableId, times, logscale,
      timeIdx: startingIndex,
      wmsTime: times[startingIndex],
      range: {}
    };
  });
}

function getRasterParamsPromise(instance, meta) {
  // return a promise for an object containing initial raster parameters:
  // scalar parameters plus a palette
  return getScalarParamsPromise(instance, meta).then(params => {
    let palette = 'x-Occam';
    if (!_.isUndefined(getVariableOptions(params.variableId, 'defaultRasterPalette'))) {
        palette = getVariableOptions(params.variableId, 'defaultRasterPalette');
    }
    params.palette = palette;
    return params;
  });  
}

function getIsolineParamsPromise(instance, meta) {
  // return a promise for an object containing initial coloured isoline parameters:
  // scalar parameters plus a palette. 
  return getScalarParamsPromise(instance, meta).then(params => {
    params.palette = 'x-Occam';
    return params;
  });
}

function getAnnotatedParamsPromise(instance, meta) {
  // return a promise for an object containing initial annotated isoline 
  // parameters, which are the same as the default scalar parameters.
  return getScalarParamsPromise(instance, meta);
}

  export {
    hasValidData,
    hasComparand,
    getRasterParamsPromise,
    getIsolineParamsPromise,
    getAnnotatedParamsPromise,
    is0thIndex,
    selectedVariable
  };