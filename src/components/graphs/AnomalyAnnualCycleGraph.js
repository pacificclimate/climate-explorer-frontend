/****************************************************************************
 * AnomalyAnnualCycleGraph.js - contrast present and future climatology values
 * 
 * Given a data specification (model_id, experiment, variable_id),
 * provides functions to help generate a graph specification contrasting
 * current (2010-2039) and future (2040-2069, 2070-2099) Annual Cycle data:
 * 
 *   - getMetadata locates metadata for multiple three climatology periods
 *   - dataToGraphSpec formats a graph to shade the climatology periods
 * 
 * Similar to SingleAnnualCycleGraph, but instead of displaying the annual
 * cycle at multiple time resolutions (yearly, seasonal, monthly), the annual
 * cycle is displayed for different climatology periods.
 ****************************************************************************/

import React from 'react';

import _ from 'underscore';

import { timeseriesToAnnualCycleGraph } from '../../core/chart-generators';
import { makeAnomalyGraph } from '../../core/chart-transformers';
import { findMatchingMetadata } from './graph-helpers';
import AnnualCycleGraph from './AnnualCycleGraph';


export default function AnomalyAnnualCycleGraph(props) {
  
  function getPresentMetadatas(includeFuture = false) {
    // returns an array of all metadata objects that conform 
    // to the user-selected parameters and contain data that 
    // includes the current year (or future years, if includeFuture is true).
    const currentYear = new Date().getFullYear();
    
    return _.filter(props.meta, md => {
      return md.model_id === props.model_id &&
      md.experiment === props.experiment &&
      md.variable_id === props.variable_id &&
      md.end_date >= currentYear &&
      (includeFuture || md.start_date <= currentYear);
    });
  }
  
  function getMetadata(dataSpec) {

    const {
      model_id, experiment,
      variable_id, meta,
    } = props;

    // Find the highest-resolution dataset that describes the present.
    const presentMetadatas = getPresentMetadatas();
    const presentMetadata = _.findWhere(presentMetadatas, {timescale: "monthly"})
                            || _.findWhere(presentMetadatas, {timescale: "seasonal"})
                            || _.findWhere(presentMetadatas, {timescale: "annual"});

    return _.isUndefined(presentMetadata)? [] : _.where(getPresentMetadatas(meta, true), 
        {timescale: presentMetadata.timescale});
  }

  function dataToGraphSpec(meta, data) {
    let graph = timeseriesToAnnualCycleGraph(meta, ...data);
    // Select the lowest starting year as the base series for the anomaly graph
    let seriesNames = _.without(graph.data.columns.map(series => _.first(series)), 'x');
    seriesNames.sort();
    graph = makeAnomalyGraph(seriesNames[0], graph);
    return graph;
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'experiment', 'area'
  );

  return (
    <AnnualCycleGraph
      {...graphProps}
      meta={getPresentMetadatas(false)}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}
