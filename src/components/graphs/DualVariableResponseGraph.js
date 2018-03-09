/*********************************************************************
 * DualVariableResponseGraph.js - Variable Response Graph for variable
 *                                comparison
 * 
 * This graph shows the influnce of the secondary variable ('comparand')
 * on the primary variable ('variable') irrespective of time.
 * 
 * It is composed from timeseries data with matching availability for
 * both variables. Each point in time t with data from both variables
 * (t, var(t)) and (t, comp(t)) will appears as the scatterplot point
 * (comp(t), var(t)) instead.
 * 
 * The comparand will appear along the x axis as the explanatory
 * variable; the primary variable will appear along the y axis as the
 * response variable.
 * 
 * Can be constructed from any time series, including both nominal time 
 * data and climatology data. Selects the highest time resolution
 * available and skips lower time resolutions to avoid counting any 
 * datum twice.
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
    const resolutionsAvailable = _.uniq(_.pluck(meta, 'timescale'));
    const resolution = _.indexOf(resolutionsAvailable, 'monthly') != -1 ? 'monthly' : 
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
    let graphSpec = timeseriesToTimeseriesGraph(meta, ...data);
    
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
