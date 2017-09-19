/********************************************************
 * util-test.js - tests for the functions in util.js
 * 
 * There is one test (sometimes multiple parts) for each
 * function in ../util.js. The tests have the same names as
 * the functions being tested, and are in the same order
 * inside this file.
 * 
 * sample data from ./sample-API-results.js 
 ********************************************************/


jest.dontMock('../util');
jest.dontMock('../export');
jest.dontMock('underscore');
jest.dontMock('xlsx');

var _ = require('underscore');
var xlsx = require('xlsx');
var util = require('../util');
var mockAPI = require('./sample-API-results');

  //expected results for the parseBootstrapTableData test - the
  // ./sample-API-Results.tasmaxStats data rendered into a table.
  const bootstrapTableTestExpected = [ 
    {
      "max": 7.41,
      "mean": -20.6,
      "median": -21.79,
      "min": -37.53,
      "model_period": '1961 - 1990',
      "run": 'r1i1p1',
      "stdev": 8.59,
      "units": 'degC'
     },
     {
       "max": 7.91,
       "mean": -19.53,
       "median": -20.56,
       "min": -36.13,
       "model_period": '1981 - 2010',
       "run": 'r1i1p1',
       "stdev": 8.25,
       "units": 'degC'
     }
    ];

  describe('parseBootstrapTableData', function () {
    it('correctly flattens a stats object for passing to the DataTable component', function () {
      var result = util.parseBootstrapTableData(mockAPI.addRunToStats(), 
          mockAPI.metadataToArray());
      expect(result).toEqual(bootstrapTableTestExpected);
    });
  });
 
  describe('validateProjectedChangeData', function () {
    it('rejects empty data sets', function () {
      var func = function () {util.validateProjectedChangeData({data: {}});};
      expect(func).toThrow();
    });
    it('rejects Workzeug error messages', function () {
      var func = function () {util.validateProjectedChangeData( { data: 
          `<html>
           <head>
           <title>IndexError // Werkzeug Debugger</title>`});};
      expect(func).toThrow();
    });
    it('rejects data without units', function () {
      var noUnits = {"data": {}};
      noUnits.data["r1i1pi"] = _.omit(noUnits.data["r1i1p1"], 'units');
      var func = function () {util.validateProjectedChangeData(noUnits);};
      expect(func).toThrow();
    });
    it('accepts valid data', function () {
      var valid = {};
      valid.data = mockAPI.tasmaxData;
      expect(util.validateProjectedChangeData(valid)).toBe(valid);
    });
  });
  
  describe('validateStatsData', function () {
    var id = mockAPI.monthlyTasmaxTimeseries.id;
    it('rejects empty data sets', function () {
      var func = function () {util.validateStatsData({ data: {}});};
      expect(func).toThrow();
    });
    it('rejects Workzeug error messages', function () {
      var func = function () {util.validateStatsData({data: 
        `<html>
        <head>
        <title>IndexError // Werkzeug Debugger</title>`});};
      expect(func).toThrow();
    });
    it('rejects NaN values', function () {
      var nan = JSON.parse(JSON.stringify(mockAPI.tasmaxStats));
      nan[id].max = Number.NaN;
      var func = function () {util.validateStatsData({data: nan});};
      expect(func).toThrow();      
    });
    it('rejects missing statistical values', function () {
      var missing = JSON.parse(JSON.stringify(mockAPI.tasmaxStats));
      missing[id] = _.omit(missing[id], "mean");
      var func = function() {util.validateStatsData({data: missing});};
      expect(func).toThrow();
    });
    it('rejects datasets missing units', function () {
      var noUnits = JSON.parse(JSON.stringify(mockAPI.tasmaxStats));
      noUnits[id] = _.omit(noUnits[id], "units");
      var func = function () {util.validateStatsData({data: noUnits});};
      expect(func).toThrow();
    });
    it('accepts valid datasets', function () {
      expect(util.validateStatsData({data: mockAPI.tasmaxStats})).toEqual({data: mockAPI.tasmaxStats});
    });
  });
      
  describe('validateAnnualCycleData', function () {
    it('rejects empty data sets', function () {
      var func = function () {util.validateAnnualCycleData({data: {}});};
      expect(func).toThrow();
    });
    it('rejects Workzeug error messages', function () {
      var func = function () {util.validateAnnualCycleData({data: 
        `<html>
        <head>
        <title>IndexError // Werkzeug Debugger</title>`});};
      expect(func).toThrow();
    });
    it('rejects data sets without units', function () {
      var noUnits = _.omit(mockAPI.monthlyTasmaxTimeseries, "units");
      var func = function () {util.validateAnnualCycleData({data: noUnits});};
      expect(func).toThrow();
    });
    it('rejects concatenanted chronology data', function () {
      //construct a concatenated chronology of the type we no 
      //longer support by combining monthly, seasonal, and annual data
      var concatenatedTasmaxTimeseries = JSON.parse(JSON.stringify(mockAPI.monthlyTasmaxTimeseries));
      _.extend(concatenatedTasmaxTimeseries.data, mockAPI.seasonalTasmaxTimeseries.data);
      _.extend(concatenatedTasmaxTimeseries.data, mockAPI.annualTasmaxTimeseries.data);
      var func = function () {util.validateAnnualCycleData({data: concatenatedTasmaxTimeseries});};
      expect(func).toThrow();
    });
    it('accepts valid monthly resolution data', function () {
      expect(util.validateAnnualCycleData({data: mockAPI.monthlyTasmaxTimeseries})).toEqual({data: mockAPI.monthlyTasmaxTimeseries});
    });
    it('accepts valid seasonal resolution data', function () {
      expect(util.validateAnnualCycleData({data: mockAPI.seasonalTasmaxTimeseries})).toEqual({data: mockAPI.seasonalTasmaxTimeseries});
    });
    it('accepts valid yearly resolution data', function () {
      expect(util.validateAnnualCycleData({data: mockAPI.annualTasmaxTimeseries})).toEqual({data: mockAPI.annualTasmaxTimeseries});
    });
  });

  describe('timeIndexToTimeOfYear', function() {
    it('converts a time index into human-readable string', function () {
      expect(util.timeIndexToTimeOfYear(1)).toBe("February");
      expect(util.timeIndexToTimeOfYear(16)).toBe("Annual");
      expect(util.timeIndexToTimeOfYear(39)).toBe(undefined);
    });
  });

  describe('timeResolutionIndexToTimeOfYear', function () {
    it('converts a time resolution + time index to a string', function () {
      expect(util.timeResolutionIndexToTimeOfYear("monthly", 3)).toBe("April");
      expect(util.timeResolutionIndexToTimeOfYear("seasonal", 0)).toBe("Winter-DJF");
      expect(util.timeResolutionIndexToTimeOfYear("yearly", 0)).toBe("Annual");
      expect(util.timeResolutionIndexToTimeOfYear("daily", 200)).toBe("daily 200");
      expect(util.timeResolutionIndexToTimeOfYear("monthly", 45)).toBe("monthly 45");
    });
  });
  
  describe('extendedDateToBasicDate', function () {
    it('converts an extended format date to a basic format date', function () {
      expect(util.extendedDateToBasicDate("1997-01-15T00:00:00Z")).toBe("1997-01-15");
      expect(util.extendedDateToBasicDate("2030-12-18T23:16:59Z")).toBe("2030-12-18");
    });
  });

  describe('timestampToTimeOfYear', function () {
    
  });

  describe('capitalizeWords', function () {
    it('capitalizes the first letter of each word in a string', function () {
      expect(util.capitalizeWords("initial lowercase string")).toBe("Initial Lowercase String");
      expect(util.capitalizeWords("Initial uppercase")).toBe("Initial Uppercase");
      expect(util.capitalizeWords("string number the 3rd")).toBe("String Number The 3rd");
    });
  });