/* ***************************************************************
 * chart-generator-tests.js - tests for chart generation functions
 *
 * One test (sometimes with multiple parts) for each function in
 * chart-generator-tests.js. The tests have the same names and are
 * in the same order as the functions.
 *
 * test data from ./sample-API-results.js
 * validation functions from ./test-validators.js
 *****************************************************************/

import {formatYAxis,
        fixedPrecision,
        makePrecisionBySeries,
        tooltipAddTimeOfYear,
        makeTooltipDisplayNumbersWithUnits,
        timeseriesToAnnualCycleGraph,
        getMonthlyData,
        shortestUniqueTimeseriesNamingFunction,
        dataToLongTermAverageGraph,
        getAllTimestamps,
        nameAPICallParametersFunction,
        timeseriesToTimeseriesGraph} from '../chart-generators';
import {allDefinedObject,
        isRectangularArray,
        allDefinedArray} from '../__test_data__/test-validators';
import {monthlyTasmaxTimeseries,
        seasonalTasmaxTimeseries,
        annualTasmaxTimeseries,
        monthlyTasminTimeseries,
        monthlyPrTimeseries,
        tasminData,
        tasmaxData,
        metadataToArray} from '../__test_data__/sample-API-results';

jest.dontMock('../chart-generators');
jest.dontMock('../util');
jest.dontMock('lodash');

describe('formatYAxis', function () {
  it('formats a c3 y axis with units label', function () {
    const axis = formatYAxis('meters');
    expect(allDefinedObject(axis)).toBe(true);
    expect(axis.label).toEqual({ text: 'meters', position: 'outer-middle' });
    expect(axis.show).toEqual(true);
    expect(axis.tick.format(6.993)).toEqual(fixedPrecision(6.993));
  });
});

describe('fixedPrecision', function () {
  it('formats a positive number for user display', function () {
    const formatted = fixedPrecision(6.22222);
    expect(formatted).toEqual(6.22);
  });
  it('formats a negative number for user display', function () {
    const formatted = fixedPrecision(-6.3333);
    expect(formatted).toEqual(-6.33);
  });
  it('rounds a number for user display', function () {
    const formatted = fixedPrecision(6.9999);
    expect(formatted).toEqual(7);
  });
});

describe('makePrecisionBySeries', function () {
  // this test fails and is skipped because it relies on an external
  // .yaml config file that isn't easily available during jest testing.
  // In non-test usage the file is transformed and made available by webpack.
  xit('reads the config file and applies its settings', function () {
    const precision = makePrecisionBySeries({ testseries: 'tasmin' });
    expect(precision(4.777, 'testseries')).toEqual(4.8);
  });
  it('uses a default precision for unspecified variables', function () {
    const precision = makePrecisionBySeries({ testseries: 'tasmin' });
    expect(precision(4.777, 'testseries')).toEqual(4.78);
  });
});

describe('tooltipAddTimeOfYear', function() {
  it('substitutes in the name of a month', function () {
    expect(tooltipAddTimeOfYear("Monthly Bills", undefined, 100, 6)).toBe("July Bills");
    expect(tooltipAddTimeOfYear("Income Monthly", undefined, 600, 3)).toBe("Income April");
  });
  it('substitutes in the name of a season', function () {
    expect(tooltipAddTimeOfYear("Seasonal Harvest", undefined, 600, 1)).toBe("Winter-DJF Harvest");
  });
  it('does nothing when not needed', function () {
    expect(tooltipAddTimeOfYear("Eggs per Chicken", undefined, 10, 10)).toBe("Eggs per Chicken");
  });
});

describe('makeTooltipDisplayNumbersWithUnits', function () {
  let axis = {};
  axis.y = formatYAxis('meters');
  let axes = {};
  const series1 = 'height';
  const series2 = 'depth';
  axes[series1] = 'y';
  let tooltipFunction;
  it('displays unit labels when there is a single data series', function () {
    tooltipFunction = makeTooltipDisplayNumbersWithUnits(axes, axis);
    expect(tooltipFunction(5, 0, series1, 0)).toEqual('5 meters');
  });
  it('displays unit labels when there are multiple data series', function () {
    axes[series2] = 'y';
    tooltipFunction = makeTooltipDisplayNumbersWithUnits(axes, axis);
    expect(tooltipFunction(6.22, 0, series1, 0)).toEqual('6.22 meters');
    expect(tooltipFunction(7.8, 0, series2, 0)).toEqual('7.8 meters');
  });
  it('displays unit labels when there are multiple unit types', function () {
    const series3 = 'weight';
    axis.y2 = formatYAxis('kilograms');
    axes[series3] = 'y2';
    tooltipFunction = makeTooltipDisplayNumbersWithUnits(axes, axis);
    expect(tooltipFunction(9.73, 0, series1, 0)).toEqual('9.73 meters');
    expect(tooltipFunction(-2.4, 0, series2, 0)).toEqual('-2.4 meters');
    expect(tooltipFunction(100000, 0, series3, 0)).toEqual('100000 kilograms');
  });
});

describe('timeseriesToAnnualCycleGraph', function () {
  const metadata = metadataToArray();
  it('rejects data sets with too many units', function () {
    let fakeData = JSON.parse(JSON.stringify(monthlyTasminTimeseries));
    fakeData.units = 'meters';
    function func () {
      timeseriesToAnnualCycleGraph(metadata, fakeData,
          monthlyTasmaxTimeseries, monthlyPrTimeseries);
    };
    expect(func).toThrow();
  });
  it('displays a single timeseries', function () {
    const c = timeseriesToAnnualCycleGraph(metadata, monthlyTasmaxTimeseries);
    expect(allDefinedObject(c)).toBe(true);
    expect(c.data.columns.length).toEqual(1);
    expect(c.data.columns[0].length).toEqual(13);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('displays monthly, seasonal, and annual timeseries together', function () {
    const c = timeseriesToAnnualCycleGraph(metadata, monthlyTasmaxTimeseries,
        seasonalTasmaxTimeseries, annualTasmaxTimeseries);
    expect(allDefinedObject(c)).toBe(true);
    expect(isRectangularArray(c.data.columns, 3, 13)).toBe(true);
    expect(allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('displays two different variables at once', function () {
    const c = timeseriesToAnnualCycleGraph(metadata, monthlyTasmaxTimeseries,
        monthlyTasminTimeseries);
    expect(allDefinedObject(c)).toBe(true);
    expect(isRectangularArray(c.data.columns, 2, 13)).toBe(true);
    expect(allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).toBeDefined();
  });
});

describe('getMonthlyData', function () {
  it('rejects data with an unsupported time resolution', function () {
    let seventeen = {};
    for (let i = 0; i < 17; i++) {
      seventeen[Date(i)] = i * 3;
    }
    const tooMany = function () {getMonthlyData(seventeen);};
    expect(tooMany).toThrow();
  });
  it('rejects data with inconsistent time resolution', function () {
    const inconsistent = function () {
      getMonthlyData(monthlyTasmaxTimeseries.data, 'yearly');
    };
    expect(inconsistent).toThrow();
  });
  it('processes a monthly timeseries', function () {
    const processed = getMonthlyData(monthlyTasmaxTimeseries.data, 'monthly');
    expect(processed.length).toEqual(12);
    expect(processed[5]).toEqual(11.841563876512202);
    expect(processed[11]).toEqual(-16.96361296358877);
  });
  it('processes a seasonal timeseries', function () {
    const processed = getMonthlyData(seasonalTasmaxTimeseries.data, 'seasonal');
    expect(processed.length).toEqual(12);
    expect(processed[0]).toEqual(processed[11]);
  });
  it('processes an annual timeseries', function () {
    const processed = getMonthlyData(annualTasmaxTimeseries.data, 'yearly');
    expect(processed.length).toEqual(12);
    expect(processed[0]).toEqual(processed[7]);
    expect(processed[4]).toEqual(processed[11]);
  });
});

describe('shortestUniqueTimeseriesNamingFunction', function () {
  const metadata = metadataToArray();
  it('rejects identical time series', function () {
    const minimalMetadata = [{ unique_id: 'foo', md: 'bar' }, { unique_id: 'baz', md: 'bar' }];
    const minimalData = [{ id: 'foo' }, { id: 'baz' }];
    function func () {
      shortestUniqueTimeseriesNamingFunction(minimalMetadata, minimalData);
    };
    expect(func).toThrow();
  });
  it('uses a a default naming scheme for a single data series', function () {
    const nameFunction = shortestUniqueTimeseriesNamingFunction(metadata,
        [monthlyTasmaxTimeseries]);
    expect(nameFunction(metadata[0])).toEqual('Monthly Mean');
  });
  it('names series by time resolution', function () {
    const nameFunction = shortestUniqueTimeseriesNamingFunction(metadata,
        [monthlyTasmaxTimeseries, seasonalTasmaxTimeseries,
          annualTasmaxTimeseries]);
    expect(nameFunction(metadata[0])).toEqual('Monthly Mean');
    expect(nameFunction(metadata[1])).toEqual('Seasonal Mean');
    expect(nameFunction(metadata[2])).toEqual('Annual Mean');
  });
  it('names series by variable', function () {
    const nameFunction = shortestUniqueTimeseriesNamingFunction(metadata,
        [monthlyTasmaxTimeseries, monthlyTasminTimeseries]);
    expect(nameFunction(metadata[0])).toEqual('Tasmax Mean');
    expect(nameFunction(metadata[3])).toEqual('Tasmin Mean');
  });
});

describe('dataToLongTermAverageGraph', function () {
  it('rejects datasets with missing metadata', function () {
    function func () {
      dataToLongTermAverageGraph(
        [tasmaxData, tasminData]);};
    expect(func).toThrow();
  });
  it('graphs a single data series', function () {
    const c = dataToLongTermAverageGraph([tasmaxData]);
    expect(allDefinedObject(c)).toBe(true);
    expect(c.data.columns.length).toEqual(2);
    expect(c.data.columns[0].length).toEqual(7);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('graphs two data series', function () {
    const tasmaxQuery = { variable_id: 'tasmax', model_id: 'bcc-csm1-1-m' };
    const tasminQuery = { variable_id: 'tasmin', model_id: 'bcc-csm1-1-m' };
    const c = dataToLongTermAverageGraph(
        [tasmaxData, tasminData],
        [tasmaxQuery, tasminQuery]);
    expect(allDefinedObject(c)).toBe(true);
    expect(isRectangularArray(c.data.columns, 3, 7)).toBe(true);
    expect(allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).toBeDefined();
  });
  it('throw an error on more than two data series with different variables', function () {
    const tasmaxQuery = { variable_id: 'tasmax', model_id: 'bcc-csm1-1-m' };
    const tasminQuery = { variable_id: 'tasmin', model_id: 'bcc-csm1-1-m' };
    const prQuery = { variable_id: 'pr', model_id: 'bcc-csm1-1-m' };
    function func () {
      dataToLongTermAverageGraph(
        [tasmaxData, tasminData, prData],
        [tasmaxQuery, tasminQuery, prQuery]);
    };
    expect(func).toThrow();
  });
});

describe('getAllTimestamps', function () {
  it('throws an error if there is no data', function () {
    function func () {getAllTimestamps([]);};
    expect(func).toThrow();
  });
  it('throws an error if there are no available timestamps', function () {
    function func () {getAllTimestamps([{ r1p1i1: { data: {} } }]);};
    expect(func).toThrow();
  });
  it('returns timestamps associated with a data API call', function () {
    const stamps = getAllTimestamps([tasmaxData]);
    expect(stamps.length).toBe(6);
  });
  it('combines timestamps from multiple data API calls', function () {
    let fakeData = JSON.parse(JSON.stringify(tasminData));
    fakeData.r1i1p1.data = { '1990-04-01T00:00:00Z': 20, '1997-01-15T00:00:00Z': 0 };
    const stamps = getAllTimestamps([tasmaxData, fakeData]);
    expect(stamps.length).toBe(7);
  });
  it('extracts timestamps from timeseries API calls', function () {
    const stamps = getAllTimestamps([monthlyTasmaxTimeseries,
      seasonalTasmaxTimeseries]);
    expect(stamps.length).toBe(16);
  });
});

describe('nameAPICallParametersFunction', function () {
  it('refuses identical data sets', function () {
    function func () {
      nameAPICallParametersFunction(
        [{ variable: 'foo' }, { variable: 'foo' }]);};
    expect(func).toThrow();
  });
  it('refuses data sets calculated over different areas', function () {
    function func () {
      nameAPICallParametersFunction(
        [{ area: 'POLYGON+((-114,+-113,+-103,+-104+63,+-114+63))' },
         { area: 'POLYGON+((-115,+-113,+-103,+-105+63,+-115+63))' }]);};
    expect(func).toThrow();
  });
  it('assigns distinct names to data sets', function () {
    const tasmaxQuery = { variable_id: 'tasmax', model_id: 'bcc-csm1-1-m' };
    const tasminQuery = { variable_id: 'tasmin', model_id: 'bcc-csm1-1-m' };
    const nameFunction = nameAPICallParametersFunction([tasmaxQuery, tasminQuery]);
    expect(nameFunction('r1i1p1', tasmaxQuery)).toBe('tasmax r1i1p1');
    expect(nameFunction('r1i1p1', tasminQuery)).toBe('tasmin r1i1p1');
  });
});

describe('timeseriesToTimeSeriesGraph', function () {
  const metadata = metadataToArray();
  it('rejects data sets with too many units', function () {
    let fakeData = JSON.parse(JSON.stringify(monthlyTasminTimeseries));
    fakeData.units = 'meters';
    function func () {
      timeseriesToTimeseriesGraph(metadata, fakeData,
          monthlyTasmaxTimeseries, monthlyPrTimeseries);
    };
    expect(func).toThrow();
  });
  it('displays a single timeseries', function () {
    const c = timeseriesToTimeseriesGraph(metadata, monthlyTasmaxTimeseries);
    expect(allDefinedObject(c)).toBe(true);
    expect(c.data.columns[0][0]).toMatch('x');
    expect(c.data.columns.length).toEqual(2);
    expect(c.data.columns[0].length).toEqual(13);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('displays two timeseries with different units', function () {
    const c = timeseriesToTimeseriesGraph(metadata, monthlyTasmaxTimeseries,
        monthlyPrTimeseries);
    expect(allDefinedObject(c)).toBe(true);
    expect(c.data.columns[0][0]).toMatch('x');
    expect(isRectangularArray(c.data.columns, 3, 13)).toBe(true);
    expect(allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).toBeDefined();
  });
});
