/* ***************************************************************
 * chart-accessor-tests.js - tests for chart access functions
 *
 * One test (sometimes with multiple parts) for each function in
 * chart-accessor-tests.js. The tests have the same names and are
 * in the same order as the functions.
 *
 * test data from ../_test_data__/sample-API-results.js
 *****************************************************************/

jest.dontMock('../chart-accessors');
jest.dontMock('underscore');

const ca = require('../chart-accessors');
const cg = require('../chart-generators');
const mockAPI = require('../__test_data__/sample-API-results');

describe('hasTwoYAxes', function () {
  const metadata = mockAPI.metadataToArray();
  it('detects graphs that have only 1 y-axis', function () {
    const graph = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
    expect(ca.hasTwoYAxes(graph)).toBe(false);
  });
  it('detects graphs that have 2 y-axes', function () {
    const graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(),
        mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    expect(ca.hasTwoYAxes(graph)).toBe(true);
  });
});

describe('checkYAxisValidity', function () {
  const graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(),
      mockAPI.monthlyTasmaxTimeseries,
      mockAPI.monthlyPrTimeseries);
  it('does nothing for valid axes', function () {
    let func = function () {ca.checkYAxisValidity(graph, 'y');};
    expect(func).not.toThrow();
    func = function () {ca.checkYAxisValidity(graph, 'y2');};
    expect(func).not.toThrow();
  });
  it('throws an eror for invalid axes', function () {
    let func = function () {ca.checkYAxisValidity(graph, 'banana');};
    expect(func).toThrow();
  });
});

describe('yAxisUnits', function () {
  const graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(),
      mockAPI.monthlyTasmaxTimeseries,
      mockAPI.monthlyPrTimeseries);
  it('returns the units associated with the y axis', function () {
    expect(ca.yAxisUnits(graph, 'y')).toBe('degC');
    expect(ca.yAxisUnits(graph, 'y2')).toBe('kg m-2 d-1');
  });
});

describe('yAxisRange', function () {
  const graph = cg.timeseriesToAnnualCycleGraph(mockAPI.metadataToArray(),
      mockAPI.monthlyTasmaxTimeseries,
      mockAPI.monthlyPrTimeseries);
  it('calculates the min and max of data associated with a y-axis', function () {
    expect(ca.yAxisRange(graph, 'y').min).toBe(-20.599000150601793);
    expect(ca.yAxisRange(graph, 'y').max).toBe(15.835593959678455);
    expect(ca.yAxisRange(graph, 'y2').min).toBe(0.7965349522694691);
    expect(ca.yAxisRange(graph, 'y2').max).toBe(1.7647179206314954);
  });
});
