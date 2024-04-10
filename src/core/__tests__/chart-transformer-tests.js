/******************************************************************
 * chart-transformer-tests.js - tests for chart transformation 
 * functions
 * 
 * One test (sometimes with multiple parts) for each function in 
 * chart-transformers. The tests have the same names and are in 
 * the same order as the functions. 
 * 
 * test data from ./sample-API-results.js
 * validation functions from ./test-validators.js
 * chart generation uses chart-generators.js
 ********************************************************************/

import * as cg from '../chart-generators';
import * as ct from '../chart-transformers';
import * as validate from '../__test_data__/test-validators';
import * as mockAPI from '../__test_data__/sample-API-results';

jest.dontMock('../chart-generators');
jest.dontMock('../chart-transformers');
jest.dontMock('../util');
jest.dontMock('lodash');


describe('makeVariableResponseGraph', function () {
  it('transforms two timeseries into a scatterplot', function() {
    let c = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    c = ct.makeVariableResponseGraph("pr", "tasmax", c);
    expect(validate.allDefinedObject(c)).toBe(true);
    for(let i = 0; i < 12; i++) {
      let pr = Object.values(mockAPI.monthlyPrTimeseries)[i];
      let tasmax = Object.values(mockAPI.monthlyTasmaxTimeseries)[i];
      let pri = c.data.columns[0].indexOf(pr);
      let tasmaxi = c.data.columns[1].indexOf(tasmax);
      expect(pri).toEqual(tasmaxi);
    }
  });
});

describe('getAxisTextForVariable', function () {
  it('retrieves axis labels for a two-variable graph', function () {
    const c = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    expect(ct.getAxisTextForVariable(c, "tasmax")).toBe("tasmax degC");
    expect(ct.getAxisTextForVariable(c, "pr")).toBe("pr kg m-2 d-1");
  });
  it('throws an error on a single-variable graph', function () {
    const c2 = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(),
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries, 
        mockAPI.annualTasmaxTimeseries);
    const func = function () {
      ct.getAxisTextForVariable(c2, "tasmax");      };
    expect(func).toThrow(); 
  });
});

describe('makeAnomalyGraph', function() {
  it('rejects multi-variable graphs', function () {
    let doubleGraph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    let doubleFunc = function () {
      ct.makeAnomalyGraph("tasmax", doubleGraph);
    };
    expect(doubleFunc).toThrow();
  });
  it('rejects graphs with no base data', function () {
    const noBaseGraph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries, 
        mockAPI.annualTasmaxTimeseries);
    const noBaseFunc= function () { ct.makeAnomalyGraph("pr", noBaseGraph)};
    expect(noBaseFunc).toThrow();
  });
  it('rejects graphs with mismatched data resolutions', function () {
    let dataMissingGraph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries, 
        mockAPI.annualTasmaxTimeseries);
    dataMissingGraph.data.columns[1] = dataMissingGraph.data.columns[1].slice(0, 5);
    const dataMissingFunc = function () {ct.makeAnomalyGraph("Monthly Mean", dataMissingGraph)};
    expect(dataMissingFunc).toThrow();
  });
  it('generates an anomaly graph', function () {
    const graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries, 
        mockAPI.annualTasmaxTimeseries);
    const anomalyGraph = ct.makeAnomalyGraph("Monthly Mean", "tasmax", graph);
    expect(anomalyGraph.data.columns.length).toBe(5);
    expect(validate.allDefinedObject(anomalyGraph)).toBe(true);
    expect(validate.allDefinedArray(anomalyGraph.data.columns)).toBe(true);
    expect(anomalyGraph.axis.y2).toBeDefined();
  });
});

describe('percentageChange', function() {
  it('calculates the percentage different between two values', function () {
    expect(ct.percentageChange(2, 3)).toBe(50);
    expect(ct.percentageChange(4, 2)).toBe(-50);
    expect(ct.percentageChange(-2, -3)).toBe(-50);
    expect(ct.percentageChange(-4, -2)).toBe(50);
  });
  it('returns null when calculating percent change from 0', function () {
    expect(ct.percentageChange(0, 0)).toBeNull();
    expect(ct.percentageChange(0, 2)).toBeNull();
    expect(ct.percentageChange(0, -1)).toBeNull();
  });
});

describe('addAnomalyTooltipFormatter', function () {
  it('appends an anomaly value to tooltip listings', function () {
  const graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
      mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, 
      mockAPI.annualTasmaxTimeseries);
  const oldTooltipFormat = graph.tooltip.format.value;
  const anomalyGraph = ct.makeAnomalyGraph("Monthly Mean", "tasmax", graph);
  const newTooltipFormat = anomalyGraph.tooltip.format.value;
  expect(oldTooltipFormat(-18, 0, "Monthly Mean", 1)).toBe("-18 degC");
  expect(newTooltipFormat(-18, 0, "Monthly Mean", 1)).toBe("-18 degC (+0.81)");
  });
  xit('displays anomaly as a percentage for precipitation', function () {
    //this functionality relies on reading the variable config yaml, not yet
    //available for testing.
  });
});

describe('makeTimeSliceGraph', function () {
  it('rejects non-existent timestamps', function () {
    let graph = cg.dataToLongTermAverageGraph([mockAPI.tasmaxData]);
    const func = function () {ct.makeTimeSliceGraph("3000-01-15", graph)};
    expect(func).toThrow();
  });
  it('generates a monthly timeslice', function () {
    const graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(),
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries,
        mockAPI.annualTasmaxTimeseries);
    const timeSliceGraph = ct.makeTimeSliceGraph("March", graph);
    for(let c of timeSliceGraph.data.columns) {
      expect(c.length).toBe(2);
    }
  });
  it('generates a yearly timeslice', function () {
    let graph = cg.dataToLongTermAverageGraph([mockAPI.tasmaxData]);
    const timeSliceGraph = ct.makeTimeSliceGraph("1990-01-01", graph);
    for(let c of timeSliceGraph.data.columns) {
      expect(c.length).toBe(2);
    }
    expect(timeSliceGraph.axis.x.type).toBe("category");
  });
});

