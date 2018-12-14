import React from 'react';

import _ from 'underscore';

import { timeseriesToAnnualCycleGraph } from '../../core/chart-generators';
import {
  assignColoursByGroup,
  fadeSeriesByRank,
  padYAxis,
  matchYAxisRange,
} from '../../core/chart-formatters';
import {
  hasTwoYAxes,
  yAxisUnits,
  yAxisRange,
} from '../../core/chart-accessors';
import AnnualCycleGraph from './AnnualCycleGraph';
import {
  getVariableOptions,
  findMatchingMetadata,
} from '../../core/util';

export default function DualAnnualCycleGraph(
  { model_id, experiment, variable_id, meta, comparand_id, comparandMeta, area }
) {
  function getMetadata(dataSpec) {
    // Find and return metadata matching the data specification (`dataSpec`):
    // model_id, experiment, variable_id, start_date, end_date, ensemble_member
    // for monthly, seasonal and annual timescales.
    // Variable, model, and experiment are supplied by the graph's parent, but
    // start, end, and run are selected here.
    // Do the the same for comparand_id and comparandMeta.

    // `dateTolerance` establishes the tolerance (in years) for matches to
    // `start_date` and `end_date`. (`dataSpec` specifies the values to match.)
    const dateTolerance = 1;

    const timescales = ['monthly', 'seasonal', 'yearly'];

    // Find matching metadata sets for variable (`variable_id`).
    const variableMetadataSets = timescales.map(timescale =>
      findMatchingMetadata(meta, dateTolerance, {
        model_id, experiment,
        variable_id: variable_id,
        timescale, ...dataSpec,
      })
    );

    // Find matching metadata sets for comparand (comparand_id).
    // Only use comparand metadata sets for which there is a corresponding
    // variable metadata set with the same timescale.
    // This is a function because we don't always compute it.
    const comparandMetadataSets = () => timescales.map((timescale, i) =>
      variableMetadataSets[i] &&
      findMatchingMetadata(comparandMeta, dateTolerance, {
        model_id, experiment,
        variable_id: comparand_id,
        timescale, ...dataSpec,
      })
    );

    // Extend variable metadata sets with comparand metdata sets
    // if the comparand is different from the variable.
    const allMetadataSets = variableMetadataSets.concat(
      variable_id === comparand_id ? [] : comparandMetadataSets()
    );

    return _.compact(allMetadataSets);
  }

  function dataToGraphSpec(meta, data) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.

    let graph = timeseriesToAnnualCycleGraph(meta, ...data);

    // function that assigns each data series to one of two groups based on
    // which variable it represents. Passed to assignColoursByGroup to assign
    // graph line colors.
    const sortByVariable = dataSeries => {
      const seriesName = dataSeries[0].toLowerCase();
      if (seriesName.search(variable_id.toLowerCase()) !== -1) {
        return 0;
      } else if (seriesName.search(comparand_id.toLowerCase()) !== -1) {
        return 1;
      } else {
        // if only one variable is selected, it won't be in any series names.
        return seriesName;
      }
    };

    graph = assignColoursByGroup(graph, sortByVariable);

    //function that assigns seasonal and annual timeseries lower "rank"
    //then monthly timeseries. Passed to fadeSeries to make higher-resolution
    //data stand out more.
    const rankByTimeResolution = (dataSeries) => {
      var seriesName = dataSeries[0].toLowerCase();
      if (seriesName.search('monthly') !== -1) {
        return 1;
      } else if (seriesName.search('seasonal') !== -1) {
        return 0.6;
      } else if (seriesName.search('yearly') !== -1) {
        return 0.3;
      }
      //no time resolution indicated in timeseries. default to full rank.
      return 1;
    };

    graph = fadeSeriesByRank(graph, rankByTimeResolution);

    // In a few cases, different variables move in lockstep over the course of
    // the year, e.g tasmin and tasmax: tasmin is almost always about 9
    // degrees lower than tasmax. These pairs of variables will be hard to
    // understand in a comparison graph, because c3's normally excellent
    // smart formatting will automatically scale each data set vertically
    // to take advantage of the entire graph space, making the two sets of
    // graph lines nearly identical.
    //
    // The variable configuration file indicates which pairs of variables are
    // expected to have this issue. If either of the two currently displayed
    // variables lists the other as a visual conflict (using the "shiftAnnualCycle"
    // attribute), they will be detangled by padding the graph y-scales to
    // shift their respective graph lines apart vertically.
    if (hasTwoYAxes(graph) && comparand_id !== variable_id) {
      // see if either variable is listed as conflicting with the other
      const variableOverlaps = getVariableOptions(variable_id, "shiftAnnualCycle");
      const comparandOverlaps = getVariableOptions(comparand_id, "shiftAnnualCycle");
      
      const overlap = (comparandOverlaps && comparandOverlaps.includes(variable_id))
        || (variableOverlaps && variableOverlaps.includes(comparand_id));
      
      if(overlap) {
        // if the two data series have overlapping ranges and the same units,
        // set their y axes to the same range to avoid 
        // the misleading visuals of *slightly* different y axes.
        //
        // otherwise, just pad each axis by a flat 20% to move the
        // data sets apart visually.

        // determine whether the data ranges overlap:
        const yRange = yAxisRange(graph, 'y');
        const y2Range = yAxisRange(graph, 'y2');
        if(yAxisUnits(graph, 'y') === yAxisUnits(graph, 'y2') &&
           !(yRange.max < y2Range.min || y2Range.max < yRange.min)) {
          // y axes will have the same range
          graph = matchYAxisRange(graph);
        }
        else {
          // y axes padded by 20%
          const shiftUpAxis = yRange.max > y2Range.max ? "y" : "y2";
          const shiftDownAxis = yRange.max < y2Range.max ? "y" : "y2";
          graph = padYAxis(graph, shiftUpAxis, "bottom", .2);
          graph = padYAxis(graph, shiftDownAxis, "top", .2);
        }
      }
    }
    return graph;
  }

  return (
    <AnnualCycleGraph
      {...{ model_id, experiment, variable_id, meta,
        comparand_id, comparandMeta, area }
      }
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}
