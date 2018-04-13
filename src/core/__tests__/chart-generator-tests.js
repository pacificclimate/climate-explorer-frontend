/*****************************************************************
 * chart-generator-tests.js - tests for chart generation functions
 * 
 * One test (sometimes with multiple parts) for each function in 
 * chart-generator-tests.js. The tests have the same names and are
 * in the same order as the functions. 
 * 
 * test data from ./sample-API-results.js
 * validation functions from ./test-validators.js
 *******************************************************/

jest.dontMock('../chart-generators');
jest.dontMock('../util');
jest.dontMock('underscore');

var cg = require('../chart-generators'); 
var validate = require('../__test_data__/test-validators');
var mockAPI = require('../__test_data__/sample-API-results');

describe ('formatYAxis', function () {
  it('formats a c3 y axis with units label', function () {
    var axis = cg.formatYAxis("meters");
    expect(validate.allDefinedObject(axis)).toBe(true);
    expect(axis.label).toEqual({"text": "meters", "position": "outer-middle"});
    expect(axis.show).toEqual(true);
    expect(axis.tick.format(6.993)).toEqual(cg.fixedPrecision(6.993));
  });
});

describe('fixedPrecision', function () {
  it('formats a positive number for user display', function () {
    var formatted = cg.fixedPrecision(6.22222);
    expect(formatted).toEqual(6.22);
  });
  it('formats a negative number for user display', function() {
    var formatted = cg.fixedPrecision(-6.3333);
    expect(formatted).toEqual(-6.33);
  });
  it('rounds a number for user display', function () {
    var formatted = cg.fixedPrecision(6.9999);
    expect(formatted).toEqual(7);
  });
});

describe('makePrecisionBySeries', function () {
  //this test fails and is skipped because it relies on an external 
  //.yaml config file that isn't easily available during jest testing. 
  //In non-test usage the file is transformed and made available by webpack.
  xit('reads the config file and applies its settings', function() {
    var precision = cg.makePrecisionBySeries({"testseries": "tasmin"});
    expect(precision(4.777, "testseries")).toEqual(4.8);
  });
  it('uses a default precision for unspecified variables', function () {
    var precision = cg.makePrecisionBySeries({"testseries": "tasmin"});
    expect(precision(4.777, "testseries")).toEqual(4.78);
  });
});

describe('makeTooltipDisplayNumbersWithUnits', function () {
  var axis = {};
  axis.y = cg.formatYAxis("meters");
  var axes = {};
  var series1 = "height";
  var series2 = "depth";
  axes[series1] = "y";
  var tooltipFunction;
  it('displays unit labels when there is a single data series', function () {
    tooltipFunction = cg.makeTooltipDisplayNumbersWithUnits(axes, axis);
    expect(tooltipFunction(5, 0, series1, 0)).toEqual("5 meters");
  });
  it('displays unit labels when there are multiple data series', function () {
    axes[series2] = "y";
    tooltipFunction = cg.makeTooltipDisplayNumbersWithUnits(axes, axis);
    expect(tooltipFunction(6.22, 0, series1, 0)).toEqual("6.22 meters");
    expect(tooltipFunction(7.8, 0, series2, 0)).toEqual("7.8 meters");
  });
  it('displays unit labels when there are multiple unit types', function () {
    var series3 = "weight";
    axis.y2 = cg.formatYAxis("kilograms");
    axes[series3] = "y2";
    tooltipFunction = cg.makeTooltipDisplayNumbersWithUnits(axes, axis);
    expect(tooltipFunction(9.73, 0, series1, 0)).toEqual("9.73 meters");
    expect(tooltipFunction(-2.4, 0, series2, 0)).toEqual("-2.4 meters");
    expect(tooltipFunction(100000, 0, series3, 0)).toEqual("100000 kilograms");
  }); 
});

describe('timeseriesToAnnualCycleGraph', function () {
  var metadata = mockAPI.metadataToArray();
  it('rejects data sets with too many units', function () {
    var fakeData = JSON.parse(JSON.stringify(mockAPI.monthlyTasminTimeseries));
    fakeData.units = "meters";
    var func = function () {
      cg.timeseriesToAnnualCycleGraph(metadata, fakeData, 
          mockAPI.monthlyTasmaxTimeseries, mockAPI.monthlyPrTimeseries);
      };
    expect(func).toThrow();  
  });
  it('displays a single timeseries', function () {
    var c = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(c.data.columns.length).toEqual(1);
    expect(c.data.columns[0].length).toEqual(13);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('displays monthly, seasonal, and annual timeseries together', function () {
    var c = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
        mockAPI.seasonalTasmaxTimeseries, mockAPI.annualTasmaxTimeseries);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(validate.isRectangularArray(c.data.columns, 3, 13)).toBe(true);
    expect(validate.allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('displays two different variables at once', function () {
    var c = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyTasminTimeseries);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(validate.isRectangularArray(c.data.columns, 2, 13)).toBe(true);
    expect(validate.allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('displays two variables with different units at once', function () {
    var c = cg.timeseriesToAnnualCycleGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(validate.isRectangularArray(c.data.columns, 2, 13)).toBe(true);
    expect(validate.allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).toBeDefined();    
  });
});

describe('getMonthlyData', function () {
  it('rejects data with an unsupported time resolution', function (){
    var seventeen = {};
    for(var i = 0; i < 17; i++){
      seventeen[Date(i)] = i * 3;
    }
    var tooMany = function() {cg.getMonthlyData(seventeen);};
    expect(tooMany).toThrow();
  });
  it('rejects data with inconsistent time resolution', function () {
    var inconsistent = function () {cg.getMonthlyData(mockAPI.monthlyTasmaxTimeseries.data, "yearly");};
    expect(inconsistent).toThrow();
  });
  it('processes a monthly timeseries', function () {
    var processed = cg.getMonthlyData(mockAPI.monthlyTasmaxTimeseries.data, "monthly");
    expect(processed.length).toEqual(12);
    expect(processed[5]).toEqual(11.841563876512202);
    expect(processed[11]).toEqual(-16.96361296358877);    
  });
  it('processes a seasonal timeseries', function () {
    var processed = cg.getMonthlyData(mockAPI.seasonalTasmaxTimeseries.data, "seasonal");
    expect(processed.length).toEqual(12);
    expect(processed[0]).toEqual(processed[11]);
  });
  it('processes an annual timeseries', function() {
    var processed = cg.getMonthlyData(mockAPI.annualTasmaxTimeseries.data, "yearly");
    expect(processed.length).toEqual(12);
    expect(processed[0]).toEqual(processed[7]);
    expect(processed[4]).toEqual(processed[11]);
  });
});

describe('shortestUniqueTimeseriesNamingFunction', function () {
  var metadata = mockAPI.metadataToArray();
  it('rejects identical time series', function () {
    var minimalMetadata = [{unique_id: "foo", md: "bar"}, {unique_id: "baz", md: "bar"}];
    var minimalData = [{id: "foo"}, {id: "baz"}];
    var func = function() {cg.shortestUniqueTimeseriesNamingFunction(minimalMetadata, minimalData);};
    expect(func).toThrow();
  });
  it('uses a a default naming scheme for a single data series', function () {
    var nameFunction = cg.shortestUniqueTimeseriesNamingFunction(metadata, [mockAPI.monthlyTasmaxTimeseries]);
    expect(nameFunction(metadata[0])).toEqual("Monthly Mean");
  });
  it('names series by time resolution', function () {
    var nameFunction = cg.shortestUniqueTimeseriesNamingFunction(metadata, 
        [mockAPI.monthlyTasmaxTimeseries, mockAPI.seasonalTasmaxTimeseries, 
          mockAPI.annualTasmaxTimeseries]);
    expect(nameFunction(metadata[0])).toEqual("Monthly Mean");
    expect(nameFunction(metadata[1])).toEqual("Seasonal Mean");
    expect(nameFunction(metadata[2])).toEqual("Yearly Mean");
  });
  it('names series by variable', function () {
    var nameFunction = cg.shortestUniqueTimeseriesNamingFunction(metadata, 
        [mockAPI.monthlyTasmaxTimeseries, mockAPI.monthlyTasminTimeseries]);
    expect(nameFunction(metadata[0])).toEqual("Tasmax Mean");
    expect(nameFunction(metadata[3])).toEqual("Tasmin Mean");
  });
});

describe('dataToLongTermAverageGraph', function() {
  it('rejects datasets with missing metadata', function () {
    var func = function () {cg.dataToLongTermAverageGraph(
        [mockAPI.tasmaxData, mockAPI.tasminData]);};
    expect(func).toThrow();      
  });
  it('graphs a single data series', function() {
    var c = cg.dataToLongTermAverageGraph([mockAPI.tasmaxData]);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(c.data.columns.length).toEqual(2);
    expect(c.data.columns[0].length).toEqual(7);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('graphs multiple data series', function () {
    var tasmaxQuery = {"variable_id": "tasmax", "model_id": "bcc-csm1-1-m"};
    var tasminQuery = {"variable_id": "tasmin", "model_id": "bcc-csm1-1-m"};
    var c = cg.dataToLongTermAverageGraph(
        [mockAPI.tasmaxData, mockAPI.tasminData],
        [tasmaxQuery, tasminQuery]);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(validate.isRectangularArray(c.data.columns, 3, 7)).toBe(true);
    expect(validate.allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('graphs data series with distinct units', function () {
    var tasmaxQuery = {"variable_id": "tasmax", "model_id": "bcc-csm1-1-m"};
    var tasminQuery = {"variable_id": "tasmin", "model_id": "bcc-csm1-1-m"};
    var prQuery = {"variable_id": "pr", "model_id": "bcc-csm1-1-m"};
    var c = cg.dataToLongTermAverageGraph(
        [mockAPI.tasmaxData, mockAPI.tasminData, mockAPI.prData],
        [tasmaxQuery, tasminQuery, prQuery]);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(validate.isRectangularArray(c.data.columns, 4, 7)).toBe(true);
    expect(validate.allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).toBeDefined();
    expect(c.data.axes["tasmin r1i1p1"]).not.toBe(c.data.axes["pr r1i1p1"]);
  });
});

describe('getAllTimestamps', function() {
  it('throws an error if there is no data', function () {
    var func = function () {cg.getAllTimestamps([]);};
    expect(func).toThrow();
  });
  it('throws an error if there are no available timestamps', function () {
    var func = function () {cg.getAllTimestamps([{"r1p1i1": {"data": {}}}]);};
    expect(func).toThrow();
  });
  it('returns timestamps associated with a data API call', function () {
    var stamps = cg.getAllTimestamps([mockAPI.tasmaxData]);
    expect(stamps.length).toBe(6);
  });
  it('combines timestamps from multiple data API calls', function () {
    var fakeData = JSON.parse(JSON.stringify(mockAPI.tasminData));
    fakeData["r1i1p1"].data = {"1990-04-01T00:00:00Z": 20, "1997-01-15T00:00:00Z": 0};
    var stamps = cg.getAllTimestamps([mockAPI.tasmaxData, fakeData]);
    expect(stamps.length).toBe(7);
  });
  it('extracts timestamps from timeseries API calls', function () {
    var stamps = cg.getAllTimestamps([mockAPI.monthlyTasmaxTimeseries, mockAPI.seasonalTasmaxTimeseries]);
    expect(stamps.length).toBe(16);
  });
});

describe('nameAPICallParametersFunction', function () {
  it('refuses identical data sets', function () {
    var func = function () {cg.nameAPICallParametersFunction(
        [{"variable": "foo"}, {"variable": "foo"}]);};
    expect(func).toThrow();
  });
  it('refuses data sets calculated over different areas', function () {
    var func = function () {cg.nameAPICallParametersFunction(
        [{"area": "POLYGON+((-114,+-113,+-103,+-104+63,+-114+63))"},
         {"area": "POLYGON+((-115,+-113,+-103,+-105+63,+-115+63))"}]);};
    expect(func).toThrow();
  });
  it('assigns distinct names to data sets', function () {
    var tasmaxQuery = {"variable_id": "tasmax", "model_id": "bcc-csm1-1-m"};
    var tasminQuery = {"variable_id": "tasmin", "model_id": "bcc-csm1-1-m"};
    var nameFunction = cg.nameAPICallParametersFunction([tasmaxQuery, tasminQuery]);
    expect(nameFunction("r1i1p1", tasmaxQuery)).toBe("tasmax r1i1p1");
    expect(nameFunction("r1i1p1", tasminQuery)).toBe("tasmin r1i1p1");
  });
});

describe('timeseriesToTimeSeriesGraph', function () {
  var metadata = mockAPI.metadataToArray();
  it('rejects data sets with too many units', function () {
    var fakeData = JSON.parse(JSON.stringify(mockAPI.monthlyTasminTimeseries));
    fakeData.units = "meters";
    var func = function () {
      cg.timeseriesToTimeseriesGraph(metadata, fakeData,
          mockAPI.monthlyTasmaxTimeseries, mockAPI.monthlyPrTimeseries);
      };
    expect(func).toThrow();
  });
  it('displays a single timeseries', function () {
    var c = cg.timeseriesToTimeseriesGraph(metadata, mockAPI.monthlyTasmaxTimeseries);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(c.data.columns[0][0]).toMatch('x');
    expect(c.data.columns.length).toEqual(2);
    expect(c.data.columns[0].length).toEqual(13);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).not.toBeDefined();
  });
  it('displays two timeseries with different units', function() {
    var c = cg.timeseriesToTimeseriesGraph(metadata, mockAPI.monthlyTasmaxTimeseries,
        mockAPI.monthlyPrTimeseries);
    expect(validate.allDefinedObject(c)).toBe(true);
    expect(c.data.columns[0][0]).toMatch('x');
    expect(validate.isRectangularArray(c.data.columns, 3, 13)).toBe(true);
    expect(validate.allDefinedArray(c.data.columns)).toBe(true);
    expect(c.axis.x).toBeDefined();
    expect(c.axis.y).toBeDefined();
    expect(c.axis.y2).toBeDefined();
  });
});