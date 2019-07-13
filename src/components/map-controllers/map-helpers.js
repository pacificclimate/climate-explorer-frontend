/************************************************************************
 * map-helpers.js - helper functions for MapControllers
 * 
 * Functions in this file fall into three general categories:
 * 
 *   0. Data processing helper functions, which extract information from
 *      a MapController props object or piece of one.
 *   
 *   1. WMS parameter generation functions, which generate initial 
 *      parameters for ncWMS layers of various types.
 *      
 *   2. State and handler functions shared by multiple MapControllers
 ************************************************************************/
import _ from 'lodash';

import { getTimeMetadata } from '../../data-services/ce-backend';
import { getVariableOptions } from '../../core/util';

/************************************************************************
 * 0. Data processing helpers
 ************************************************************************/

function hasValidData(symbol, props) {
  // Returns true if props contains enough information to generate a map
  // for the primary (symbol is 'variable') or secondary ('comparand') variable.
  var dataLocation = symbol === 'variable' ? 'meta' : 'comparandMeta';
  var dataName = `${symbol}_id`;

  return !_.isUndefined(props[dataName]) &&
    !_.isUndefined(props[dataLocation]) &&
    props[dataLocation].length > 0;
}

function hasComparand(props) {
  return this.hasValidData('comparand', props);
}

// predicate that detects whether a timestamp index is a 0th index:
// either January, winter, or the first year in a file. 
const is0thIndex = timestamp => (JSON.parse(timestamp).timeidx == 0);

// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
// TODO: There may also be a second issue to do with encoding timeVarIdx
function getDatasetId(varSymbol, varMeta, encodedVarTimeIdx) {
  let dataset = undefined;
  if (encodedVarTimeIdx) {
    if (hasValidData(varSymbol, this.props)) {
      const timeIndex = JSON.parse(encodedVarTimeIdx);
      dataset = _.findWhere(varMeta, {
        ensemble_member: this.state.run,
        start_date: this.state.start_date,
        end_date: this.state.end_date,
        timescale: timeIndex.timescale,
      });
    }
  }
  // dataset may not exist if generating a map for a single-variable portal
  return dataset && dataset.unique_id;
}


/********************************************************************
 * 1. WMS parameter generating functions
 ********************************************************************/

function getTimeParametersPromise(dataSpec, meta) {
  // Returns a promise for an indexed list of all timestamps available for the
  // selected data specification in files whose metadata is in the "meta" array.
  // The indices are stringified objects with timescale
  // and timeidx attributes, for example, for a climatological mean:
  //   {timescale: monthly, timeidx: 0} is January.
  //   {timescale: seasonal, timeidx: 2} is Summer
  // For a nominal-time dataset, the indices would look like:
  //   {timescale: annual, timeidx: 0} is 1950
  //   {timescale: annual, timeidx: 1} is 1951
  // The timestamps are timestamp strings suitable for ncWMS.
  const { start_date, end_date, ensemble_member } = dataSpec;  
  let datafiles = _.filter(meta,
      { ensemble_member, start_date, end_date });
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

function scalarParams(variable, times) {
  // return an object containing initial parameters common to
  // all scalar WMS layers (raster, isoline, annotated isoline):
  //   * variableId (name of displayed variable)
  //   * times (list of all available times)
  //   * timeIdx (the index of a selected starting time)
  //   * wmsTime (the actual timestamp of the selected starting time)
  //   * logscale (boolean string, 'true' meaning logarithmic colour scaling)
  //   * range (empty object, as ncWMS won't have been queried yet)
  // given the results of the getTimesPromise
  // These are default parameters, not based on user selection or MapController
  // state, and will likely need to be tweaked by the calling MapController.
  const logscale = "false";
  const variableId = variable;
  const startingIndex = _.find(Object.keys(times), is0thIndex);
  
  return {
    variableId, times, logscale,
    timeIdx: startingIndex,
    wmsTime: times[startingIndex],
    range: {}
  };
}

function selectRasterPalette(params) {
  // add a default raster palette to a ncWMS params object: either rainbow (x-Occam)
  // or a variable default palette if the config file has one.
  let palette = 'x-Occam';
  if (!_.isUndefined(getVariableOptions(params.variableId, 'defaultRasterPalette'))) {
      palette = getVariableOptions(params.variableId, 'defaultRasterPalette');
  }
  params.palette = palette;
  return params;
}

function selectIsolinePalette(params) {
  // adds the default isoline palette (rainbow / x-Occam) to the params object.
  // TODO: add isoline numContours here when we get it working 
  params.palette = 'x-Occam';
  return params;
}

/**************************************************************************
 * 2. State handling functions shared by MapControllers
 **************************************************************************/

// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
function currentDataSpec({ run, start_date, end_date }) {
  // Return encoding of currently selected dataspec
  return `${run} ${start_date}-${end_date}`;
}

function updateLayerSimpleState(layerType, name, value) {
  this.setState(prevState => ({
    [layerType]: {
      ...prevState[layerType],
      [name]: value,
    },
  }));
}

function updateLayerTime(layerType, timeIdx) {
  // update the timestamp in state
  // timeIdx is a stringified object with a resolution  (monthly, annual, seasonal)
  // and an index denoting the timestamp's position with the file
  this.setState((prevState) => ({
    [layerType]: {
      ...prevState[layerType],  // This should not be necessary
      timeIdx,
      wmsTime: prevState[layerType].times[timeIdx],
    },
  }));
}

  export {
    hasValidData,
    hasComparand,
    getDatasetId,
    getTimeParametersPromise,
    scalarParams,
    selectRasterPalette,
    selectIsolinePalette,
    is0thIndex,
    currentDataSpec,
    updateLayerSimpleState,
    updateLayerTime
  };