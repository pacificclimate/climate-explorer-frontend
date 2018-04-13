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

jest.dontMock('../chart-generators');
jest.dontMock('../chart-transformers');
jest.dontMock('../util');
jest.dontMock('underscore');

var cg = require('../chart-generators');
var ct = require('../chart-transformers'); 
var validate = require('../__test_data__/test-validators');
var mockAPI = require('../__test_data__/sample-API-results');


describe('makeVariableResponseGraph', function () {
  it('transforms two timeseries into a scatterplot', function() {
    var c = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
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
    var c = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(), 
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    expect(ct.getAxisTextForVariable(c, "tasmax")).toBe("degC");
    expect(ct.getAxisTextForVariable(c, "pr")).toBe("kg m-2 d-1");
  });
  it('throws an error on a single-variable graph', function () {
    var c2 = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(),
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries, 
        mockAPI.annualTasmaxTimeseries);
    var func = function () {
      ct.getAxisTextForVariable(c2, "tasmax");      };
    expect(func).toThrow(); 
  });
});