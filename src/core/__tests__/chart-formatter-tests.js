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

jest.dontMock('../chart-generators');
jest.dontMock('../chart-formatters');
jest.dontMock('../util');
jest.dontMock('underscore');

var cg = require('../chart-generators');
var cf = require('../chart-formatters'); 
var validate = require('../__test_data__/test-validators');
var mockAPI = require('../__test_data__/sample-API-results');

describe('assignColoursByGroup', function () {
  var metadata = mockAPI.metadataToArray();
  var graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  it('assigns the same color to each series in a group', function () {
    var segmentFunc = function (col) {return "group"};
    var newChart = cf.assignColoursByGroup(graph, segmentFunc);
    expect(validate.allDefinedObject(newChart)).toBe(true);
    var colourAssignments = newChart.data.colors;
    var seriesKeys = Object.keys(colourAssignments);
    expect(seriesKeys.length).toBe(3);
    for(var i = 0; i < seriesKeys.length; i++) {
      expect(colourAssignments[seriesKeys[i]]).toMatch(colourAssignments[seriesKeys[0]]);
    }
  });
  it('assigns different colours to different groups', function () {
    var segmentFunc = function(col) {return col[0]};
    var newChart = cf.assignColoursByGroup(graph, segmentFunc);
    expect(validate.allDefinedObject(newChart)).toBe(true);
    var assignments = newChart.data.colors;
    var seriesKeys = Object.keys(assignments);
    for(var i = 1; i < seriesKeys.length; i++) {
      for(var j = 0; j < i; j++) {
        expect(assignments[seriesKeys[i]]).not.toBe(assignments[seriesKeys[j]]);
      }
    }
  });  
});

describe('fadeSeriesByRank', function () {
  var metadata = mockAPI.metadataToArray();
  var graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  it('does not affect tier-1 series', function () {
    var ranker = function(series) {return 1};
    graph = cf.fadeSeriesByRank(graph, ranker);
    var fader = graph.data.color;
    var series = graph.data.columns;
    for(var i = 0; i < series.length; i++) {
      var faded = fader("#000000", series[i][0]);
      expect(faded).toMatch("#000000");
    }
  });
  it('fades low-ranked series', function () {});
  var ranker = function (series) {return .5};
  graph = cf.fadeSeriesByRank(graph, ranker);
  var fader = graph.data.color;
  var series = graph.data.columns;
  for(var i = 0; i < series.length; i++) {
    var faded = fader("#000000", series[i][0]);
    expect(faded).not.toMatch("#000000");
  }
});

describe('hideSeriesInLegend', function () {
  var metadata = mockAPI.metadataToArray();
  var graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  it('removes data series from the lengend', function() {
    var hideAll = function(series) {return true};
    graph = cf.hideSeriesInLegend(graph, hideAll);
    expect(graph.legend.hide.length).toBe(3);
  });
  it('retains data series in the legend', function() {
    var showAll = function(series) {return false};
    graph = cf.hideSeriesInLegend(graph, showAll);
    expect(graph.legend.hide.length).toBe(0);
  });
});

describe('sortSeriesByRank', function (){
  var metadata = mockAPI.metadataToArray();
  var graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  var rankByTimeResolution = function (series) {
    var resolutions = ["Yearly", "Seasonal", "Monthly"];
    for(let i = 0; i < 3; i++) {
      if(series[0].search(resolutions[i]) != -1) {
        return i;
      }
    }
  }
  it('orders series by ranking', function () {
    var ranked = cf.sortSeriesByRank(graph, rankByTimeResolution);
    expect(ranked.data.columns[0][0]).toBe("Yearly Mean");
    expect(ranked.data.columns[1][0]).toBe("Seasonal Mean");
    expect(ranked.data.columns[2][0]).toBe("Monthly Mean");
  });
});

describe('hideSeriesInToolTip', function () {
  var metadata = mockAPI.metadataToArray();
  var graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  var formatFunction;
  it('removes data series from the tooltip', function() {
    var hideAll = function(series) {return true};
    graph = cf.hideSeriesInTooltip(graph, hideAll);
    formatFunction = graph.tooltip.format.value;
    expect(formatFunction(10, 19, "Yearly Mean")).toBeUndefined();
  });
  it('retains data series in the tooltip', function() {
    var showAll = function(series) {return false};
    graph.tooltip.format.value = (a, b, c, d) => {return "test"};
    graph = cf.hideSeriesInTooltip(graph, showAll);
    formatFunction = graph.tooltip.format.value; 
    expect(formatFunction(10, 29, "Monthly Mean", 0)).toBeDefined();
  });
});

describe('getDataSeriesByAxis', function () {
  var metadata = mockAPI.metadataToArray();
  var twoAxes = cg.timeseriesToTimeseriesGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.monthlyPrTimeseries);
  var oneAxis = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
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
  var metadata = mockAPI.metadataToArray();
  var graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  var func;
  it('rejects negative padding', function () {
    func = function ()  {cf.padYAxis(graph, "y", "top", -1);};
    expect(func).toThrow();
  });
  it('rejects nonexistant axes', function () {
    func = function ()  {cf.padYAxis(graph, "y1", "top", -1);};
    expect(func).toThrow();
  });
  it('rejects horizontal padding directions', function () {
    var func = function ()  {cf.padYAxis(graph, "y", "left", -1);};
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

describe('hideTicksByRange', function () {
  var metadata = mockAPI.metadataToArray();
  var graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
  var graph = cf.hideTicksByRange(graph, "y", 10, 20);
  var format = graph.axis.y.tick.format;
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