/*****************************************************************
 * SingleTimeSliceGraph.js - shows model results at a single point
 *   in time, variable and emissions scenario, with one model 
 *   highlighted.
 *   
 * Produced from the same data as SingleContextGraph, but shows a
 * single timestamp rather than comparing multiple long term 
 * averages. While this graph shows a strict subset of the data
 * available in a Model Context Graph, its simplicity and narrowness 
 * makes it possible to use it as a sidebar or popup for 
 * providing context.
 *****************************************************************/
import React from 'react';

import _ from 'underscore';

import { dataToLongTermAverageGraph } from '../../core/chart-generators';
import { makeTimeSliceGraph } from '../../core/chart-transformers';
import { selectPoint } from '../../core/chart-formatters';
import {caseInsensitiveStringSearch} from '../../core/util';
import ContextGraph from './ContextGraph';
import { emphasizeSeries } from './graph-helpers';


export default function SingleTimeSliceGraph(props) {
  //TODO: this is 100% identical to SingleContextGraph.getMetadata(),
  //as this graph uses a subset of that one's data. Combine if possible for 
  //https://github.com/pacificclimate/climate-explorer-frontend/issues/139.
  function getMetadata() {
    const {
      ensemble_name, experiment, variable_id, area, contextMeta, model_id
    } = props;

    //we prefer the lowest possible time resolution for this graph, since it's
    //used to provide broad context, not detailed data. But if the
    //selected dataset doesn't have yearly data, use whatever resolution it has.
    const model_metadata = _.where(contextMeta, {model_id: model_id, multi_year_mean: true});
    const resolutions = _.unique(_.pluck(model_metadata, "timescale")).sort();
    const timescale = resolutions[resolutions.length - 1];

    // Array of unique model_id's
    const uniqueContextModelIds = _.uniq(_.pluck(contextMeta, 'model_id'));
    const baseMetadata = {
      ensemble_name,
      experiment,
      variable_id,
      area,
      timescale: timescale,
      timeidx: 0,
      multi_year_mean: true,
    };
    const metadatas =
      uniqueContextModelIds
        .map(model_id => ({ ...baseMetadata, model_id }))
        .filter(metadata =>
          // Note: length > 0 guaranteed for item containing props.model_id
          _.where(contextMeta,
            _.omit(metadata, 'ensemble_name', 'timeidx', 'area')
          ).length > 0
        );
    return metadatas;
  }

  function dataToGraphSpec(meta, data, selectedModelId) {
    let graph = dataToLongTermAverageGraph(data, meta);

    //select the median timestamp present in the future.
    let timestamps = graph.data.columns.find(function(series) {return series[0] === 'x'});
    let futureTimestamps = [];
    for(let i = 1; i < timestamps.length; i++){
      let timestamp = Date.parse(timestamps[i]);
      if(timestamp > Date.now()) {
        futureTimestamps.push(timestamps[i]);
      }
    }
    futureTimestamps.sort();
    let selectedTimestamp = futureTimestamps[Math.ceil((futureTimestamps.length - 1) / 2)];

    graph = makeTimeSliceGraph(selectedTimestamp, graph);
    graph.size = {width: 150}; //adjust as needed to make a sidebar.
    graph = emphasizeSeries(graph, selectedModelId);

    return graph;
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'experiment', 'contextMeta', 'area'
  );

  return (
    <ContextGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}
