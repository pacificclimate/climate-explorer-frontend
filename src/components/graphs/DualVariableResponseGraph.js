/*********************************************************************
 * DualVariableResponseGraph.js - Variable Response Graph
 * 
 * This graph shows the influnce of the secondary variable ('comparand')
 * on the primary variable ('variable'). The x-axis represents the
 * comparand; the y-axis the primary variable. 
 * 
 * It is composed from timeseries data with matching availability for
 * both variables. Each point 
 *********************************************************************/
import React from 'react';

import _ from 'underscore';

import { timeseriesToTimeseriesGraph, makeVariableResponseGraph } from '../../core/chart';
import VariableResponseGraph from './VariableResponseGraph';

//TODO: error message if same variable.
export default function DualVariableResponseGraph(props) {
  function getMetadata() {
    const {
      model_id, experiment,
      variable_id, meta,
      comparand_id, comparandMeta,
    } = props;

    //determine highest resolution data available.
    let resolutionsAvailable = _.uniq(_.pluck(meta, 'timescale'));
    let resolution = _.indexOf(resolutionsAvailable, 'monthly') != -1 ? 'monthly' : 
                 _.indexOf(resolutionsAvailable, 'seasonal') != -1 ? 'seasonal' : 'yearly';
    
    // Set up metadata sets for primary variable
    const primaryVariableMetadata = _.filter(meta, {
      model_id, experiment, variable_id, 'timescale' : resolution
    });
    
    const secondaryVariableMetadata = _.filter(comparandMeta, {
      model_id,
      experiment,
      variable_id: comparand_id,
      timescale: resolution
    });
    
    return primaryVariableMetadata.concat(secondaryVariableMetadata);
  }

  function dataToGraphSpec(meta, data, variable_id, comparand_id) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    var graphSpec = timeseriesToTimeseriesGraph(meta, ...data);
    
    if(!_.isUndefined(graphSpec)) {
      graphSpec = makeVariableResponseGraph(comparand_id, variable_id, graphSpec);
    }
    
    return graphSpec;
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'comparand_id', 'experiment', 'meta', 'area'
  );

  return (
    <VariableResponseGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}
