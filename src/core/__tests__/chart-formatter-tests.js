/******************************************************************
 * chart-formatter-tests.js - tests for chart formatting functions
 * 
 * One test (sometimes with multiple parts) for each function in 
 * chart-formatters.js. The tests have the same names and are in 
 * the same order as the functions. 
 * 
 * test data from ./sample-API-results.js
 * validation functions from ./test-validators.js
 * chart generation uses chart-generators.js
 ********************************************************************/

import * as cg from '../chart-generators';
import * as cf from '../chart-formatters';
import * as validate from '../__test_data__/test-validators';
import * as mockAPI from '../__test_data__/sample-API-results';

jest.dontMock('../chart-generators');
jest.dontMock('../chart-formatters');
jest.dontMock('../util');
jest.dontMock('lodash');

describe('assignColoursByGroup', function () {
  const metadata = mockAPI.metadataToArray();
  let graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  it('assigns the same color to each series in a group', function () {
    const segmentFunc = function (col) {return "group"};
    let newChart = cf.assignColoursByGroup(graph, segmentFunc);
    expect(validate.allDefinedObject(newChart)).toBe(true);
    const colourAssignments = newChart.data.colors;
    const seriesKeys = Object.keys(colourAssignments);
    expect(seriesKeys.length).toBe(3);
    for(let key of seriesKeys) {
      expect(colourAssignments[key]).toMatch(colourAssignments[seriesKeys[0]]);
    }
  });
  it('assigns different colours to different groups', function () {
    const segmentFunc = function(col) {return col[0]};
    let newChart = cf.assignColoursByGroup(graph, segmentFunc);
    expect(validate.allDefinedObject(newChart)).toBe(true);
    const assignments = newChart.data.colors;
    const seriesKeys = Object.keys(assignments);
    for(let i = 0; i < seriesKeys.length; i++) {
      for(let j = 0; j < i; j++) {
        expect(assignments[seriesKeys[i]]).not.toBe(assignments[seriesKeys[j]]);
      }
    }
  });  
});

describe('fadeSeriesByRank', function () {
  const metadata = mockAPI.metadataToArray();
  let graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  it('does not affect tier-1 series', function () {
    const ranker1 = function(series) {return 1};
    graph = cf.fadeSeriesByRank(graph, ranker1);
    const fader = graph.data.color;
    let series = graph.data.columns;
    for(let s of series) {
      const faded = fader("#000000", s[0]);
      expect(faded).toMatch("#000000");
    }
  });
  it('fades low-ranked series', function () {});
  const ranker2 = function (series) {return .5};
  graph = cf.fadeSeriesByRank(graph, ranker2);
  const fader = graph.data.color;
  const series = graph.data.columns;
  for(let s of series) {
    let faded = fader("#000000", s[0]);
    expect(faded).not.toMatch("#000000");
  }
});

describe('hideSeriesInLegend', function () {
  const metadata = mockAPI.metadataToArray();
  let graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  it('removes data series from the lengend', function() {
    const hideAll = function(series) {return true};
    graph = cf.hideSeriesInLegend(graph, hideAll);
    expect(graph.legend.hide.length).toBe(3);
  });
  it('retains data series in the legend', function() {
    const showAll = function(series) {return false};
    graph = cf.hideSeriesInLegend(graph, showAll);
    expect(graph.legend.hide.length).toBe(0);
  });
});

describe('sortSeriesByRank', function (){
  const metadata = mockAPI.metadataToArray();
  let graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  const rankByTimeResolution = function (series) {
    const resolutions = ["Yearly", "Seasonal", "Monthly"];
    for(let i = 0; i < 3; i++) {
      if(series[0].search(resolutions[i]) != -1) {
        return i;
      }
    }
  }
  it('orders series by ranking', function () {
    const ranked = cf.sortSeriesByRank(graph, rankByTimeResolution);
    expect(ranked.data.columns[0][0]).toBe("Yearly Mean");
    expect(ranked.data.columns[1][0]).toBe("Seasonal Mean");
    expect(ranked.data.columns[2][0]).toBe("Monthly Mean");
  });
});

describe('hideSeriesInToolTip', function () {
  const metadata = mockAPI.metadataToArray();
  let graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  let formatFunction;
  it('removes data series from the tooltip', function() {
    const hideAll = function(series) {return true};
    graph = cf.hideSeriesInTooltip(graph, hideAll);
    formatFunction = graph.tooltip.format.value;
    expect(formatFunction(10, 19, "Yearly Mean")).toBeUndefined();
  });
  it('retains data series in the tooltip', function() {
    const showAll = function(series) {return false};
    graph.tooltip.format.value = (a, b, c, d) => {return "test"};
    graph = cf.hideSeriesInTooltip(graph, showAll);
    formatFunction = graph.tooltip.format.value; 
    expect(formatFunction(10, 29, "Monthly Mean", 0)).toBeDefined();
  });
});

describe('getDataSeriesByAxis', function () {
  const metadata = mockAPI.metadataToArray();
  let twoAxes = cg.timeseriesToTimeseriesGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.monthlyPrTimeseries);
  let oneAxis = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  it('associates data series for a 1-axis graph', function () {
    expect(cf.getDataSeriesByAxis(oneAxis, 'y').length).toBe(3);
    expect(cf.getDataSeriesByAxis(oneAxis, 'y2').length).toBe(0);
    expect(cf.getDataSeriesByAxis(oneAxis, 'fakeaxis').length).toBe(0);
  });
  it('associates data series for a 2-axis graph', function () {
    expect(cf.getDataSeriesByAxis(twoAxes, 'y').length).toBe(1);
    expect(cf.getDataSeriesByAxis(twoAxes, 'y2').length).toBe(1);
    expect(cf.getDataSeriesByAxis(twoAxes, 'fakeaxis').length).toBe(0);
  })
});

describe('padYAxis', function () {
  const metadata = mockAPI.metadataToArray();
  let graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  let func;
  it('rejects negative padding', function () {
    func = function ()  {cf.padYAxis(graph, "y", "top", -1);};
    expect(func).toThrow();
  });
  it('rejects nonexistant axes', function () {
    func = function ()  {cf.padYAxis(graph, "y1", "top", -1);};
    expect(func).toThrow();
  });
  it('rejects horizontal padding directions', function () {
    func = function ()  {cf.padYAxis(graph, "y", "left", -1);};
    expect(func).toThrow();
  });
  it('pads a graph by adding space at the top', function () {
    let currentMax = graph.axis.y.max;
    graph = cf.padYAxis(graph, "y", "top", 1);
    expect(graph.axis.y.max).toBeDefined();
    if(currentMax !== undefined) {
      expect(graph.axis.y.max > currentMax).toBeTrue();
    }
  });
  it('pads a graph by adding space at the bottom', function () {
    let currentMin = graph.axis.y.min;
    graph = cf.padYAxis(graph, "y", "bottom", 1);
    expect(graph.axis.y.min).toBeDefined();
    if(currentMin !== undefined) {
      expect(graph.axis.y.min < currentMin).toBeTrue();
    }
  });
});

describe('matchYAxisRange', function () {
  it('sets both y-axis of the graph to have the same range', function () {
    const metadata = mockAPI.metadataToArray();
    let graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    
    graph = cf.matchYAxisRange(graph);
    expect(graph.axis.y.min).toEqual(graph.axis.y2.min);
    expect(graph.axis.y.max).toEqual(graph.axis.y2.max);
  });  
});

describe('hideTicksByRange', function () {
  const metadata = mockAPI.metadataToArray();
  let graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  graph = cf.hideTicksByRange(graph, "y", 10, 20);
  const format = graph.axis.y.tick.format;
  it('displays axis ticks inside designated range', function () {
    expect(format(15)).toBe(15);
    expect(format(10)).toBe(10);
    expect(format(20)).toBe(20);
  });
  it('does not display axis ticks outside designated range', function () {
    expect(format(0)).toBe("");
    expect(format(39)).toBe("");
  });
});