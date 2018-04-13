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