/* ***************************************************************
 * chart-accessor-tests.js - tests for chart access functions
 *
 * One test (sometimes with multiple parts) for each function in
 * chart-accessor-tests.js. The tests have the same names and are
 * in the same order as the functions.
 *
 * test data from ../_test_data__/sample-API-results.js
 *****************************************************************/

import {hasTwoYAxes,
        checkYAxisValidity,
        yAxisUnits,
        yAxisRange} from '../chart-accessors';
import {timeseriesToAnnualCycleGraph} from '../chart-generators';
import {monthlyTasmaxTimeseries,
        seasonalTasmaxTimeseries,
        annualTasmaxTimeseries,
        monthlyPrTimeseries,
        metadataToArray} from '../__test_data__/sample-API-results';
import _ from 'lodash';

jest.dontMock('../chart-accessors');
jest.dontMock('lodash');

describe('hasTwoYAxes', function () {
  const metadata = metadataToArray();
  it('detects graphs that have only 1 y-axis', function () {
    const graph = timeseriesToAnnualCycleGraph(metadata, monthlyTasmaxTimeseries,
        seasonalTasmaxTimeseries, annualTasmaxTimeseries);
    expect(hasTwoYAxes(graph)).toBeFalsy();
  });
  it('detects graphs that have 2 y-axes', function () {
    const graph = timeseriesToAnnualCycleGraph(metadataToArray(),
        monthlyTasmaxTimeseries,
        monthlyPrTimeseries);
    expect(hasTwoYAxes(graph)).toBeTruthy();
  });
});

describe('checkYAxisValidity', function () {
  const graph = timeseriesToAnnualCycleGraph(metadataToArray(),
      monthlyTasmaxTimeseries,
      monthlyPrTimeseries);
  it('does nothing for valid axes', function () {
    let func = function () {checkYAxisValidity(graph, 'y');};
    expect(func).not.toThrow();
    func = function () {checkYAxisValidity(graph, 'y2');};
    expect(func).not.toThrow();
  });
  it('throws an eror for invalid axes', function () {
    let func = function () {checkYAxisValidity(graph, 'banana');};
    expect(func).toThrow();
  });
});

describe('yAxisUnits', function () {
  const graph = timeseriesToAnnualCycleGraph(metadataToArray(),
      monthlyTasmaxTimeseries,
      monthlyPrTimeseries);
  it('returns the units associated with the y axis', function () {
    expect(yAxisUnits(graph, 'y')).toBe('degC');
    expect(yAxisUnits(graph, 'y2')).toBe('kg m-2 d-1');
  });
});

describe('yAxisRange', function () {
  const graph = timeseriesToAnnualCycleGraph(metadataToArray(),
      monthlyTasmaxTimeseries,
      monthlyPrTimeseries);
  it('calculates the min and max of data associated with a y-axis', function () {
    expect(yAxisRange(graph, 'y').min).toBe(_.min(monthlyTasmaxTimeseries.data));
    expect(yAxisRange(graph, 'y').max).toBe(_.max(monthlyTasmaxTimeseries.data));
    expect(yAxisRange(graph, 'y2').min).toBe(_.min(monthlyPrTimeseries.data));
    expect(yAxisRange(graph, 'y2').max).toBe(_.max(monthlyPrTimeseries.data));
  });
});
