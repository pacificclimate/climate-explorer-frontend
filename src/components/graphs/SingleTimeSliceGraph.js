/*****************************************************************
 * SingleTimeSliceGraph.js - shows model results at a single point
 *   in time, variable and emissions scenario, with one model 
 *   highlighted.
 *   
 * Produced from the same data as SingleContextGraph, but shows a
 * single timestamp rather than comparing multiple long term 
 * averages. Whils this graph shows a strict subset of the data
 * available in a Model Context Graph, its simplicity and narrowness 
 * makes it possible to use it as a sidebar or popup for 
 * providing context.
 *****************************************************************/
import React from 'react';

import _ from 'underscore';

import { dataToLongTermAverageGraph } from '../../core/chart-generators';
import { makeTimeSliceGraph } from '../../core/chart-transformers';
import ContextGraph from './ContextGraph';


export default function SingleTimeSliceGraph(props) {
  //TODO: this is 100% identical to SingleContextGraph.getMetadata(),
  //as this graph uses a subset of that one's data. Combine if possible for 
  //https://github.com/pacificclimate/climate-explorer-frontend/issues/139.
  function getMetadata() {
    const {
      ensemble_name, experiment, variable_id, area, contextMeta,
    } = props;

    // Array of unique model_id's
    const uniqueContextModelIds = _.uniq(_.pluck(contextMeta, 'model_id'));
    const baseMetadata = {
      ensemble_name,
      experiment,
      variable_id,
      area,
      timescale: 'yearly',
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
    graph.legend = _.isUndefined(graph.legend) ? {}: graph.legend;
    graph.legend.position = "right";
    
    
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
    console.log(`timestamps: ${futureTimestamps} ${selectedTimestamp}`);

    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.

//    const emphasizeCurrentModel = function(graph) {
      // Classify data series by which model generated them
//      const makeModelSegmentor = function (selectedModelOutput, otherModelOutput) {
//        return function(dataseries) {
//          return dataseries[0].search(selectedModelId) !== -1 ?
//            selectedModelOutput :
//            otherModelOutput;
//        };
//      };

//      graph = assignColoursByGroup(graph, makeModelSegmentor(1, 0));
//      graph = fadeSeriesByRank(graph, makeModelSegmentor(1, 0.35));
//      graph = hideSeriesInLegend(graph, makeModelSegmentor(false, true));
//      graph = sortSeriesByRank(graph, makeModelSegmentor(1, 0));

      //simplify graph by turning off tooltip and missing data gaps
//      graph.line.connectNull = true;
//      graph.tooltip = { show: false };
//      return graph;
//    };

//    return emphasizeCurrentModel(dataToLongTermAverageGraph(data, meta));
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
