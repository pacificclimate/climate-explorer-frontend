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


import _ from 'underscore';
import xlsx from 'xlsx';
import * as util from '../util';
import * as mockAPI from '../__test_data__/sample-API-results';

jest.dontMock('../util');
jest.dontMock('../export');
jest.dontMock('underscore');
jest.dontMock('xlsx');
jest.mock('../../data-services/public.js');

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
 
  describe('validateLongTermAverageData', function () {
    it('rejects empty data sets', function () {
      var func = function () {util.validateLongTermAverageData({data: {}});};
      expect(func).toThrow();
    });
    it('rejects Workzeug error messages', function () {
      var func = function () {util.validateLongTermAverageData( { data:
          `<html>
           <head>
           <title>IndexError // Werkzeug Debugger</title>`});};
      expect(func).toThrow();
    });
    it('rejects data without units', function () {
      var noUnits = {"data": {}};
      noUnits.data["r1i1pi"] = _.omit(noUnits.data["r1i1p1"], 'units');
      var func = function () {util.validateLongTermAverageData(noUnits);};
      expect(func).toThrow();
    });
    it('accepts valid data', function () {
      var valid = {};
      valid.data = mockAPI.tasmaxData;
      expect(util.validateLongTermAverageData(valid)).toBe(valid);
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
  
  describe('validateUnstructureTimeseriesData', function () {
    it('rejects empty data sets', function () {
      var func = function () {util.validateUnstructuredTimeseriesData({data: {}});};
      expect(func).toThrow();
    });
    it('rejects Workzeug error messages', function () {
      var func = function () {util.validateUnstructuredTimeseriesData({data:
        `<html>
        <head>
        <title>IndexError // Werkzeug Debugger</title>`});};
      expect(func).toThrow();
    });
    it('rejects data sets without units', function () {
      var noUnits = _.omit(mockAPI.monthlyTasmaxTimeseries, "units");
      var func = function () {util.validateUnstructuredTimeseriesData({data: noUnits});};
      expect(func).toThrow();
    });
    it('rejects an empty timeseries', function () {
      var noTimestamps = _.omit(mockAPI.monthlyTazmarTimeseries, "times");
      noTimestamps.times = {};
      var func = function () {util.validateUnstructuredTimeseriesData({data: noTimestamps});};
      expect(func).toThrow();
    });
    it('accepts a valid timeseries', function () {
      var concatenatedTasmaxTimeseries = JSON.parse(JSON.stringify(mockAPI.monthlyTasmaxTimeseries));
      _.extend(concatenatedTasmaxTimeseries.data, mockAPI.seasonalTasmaxTimeseries.data);
      _.extend(concatenatedTasmaxTimeseries.data, mockAPI.annualTasmaxTimeseries.data);
      expect(util.validateUnstructuredTimeseriesData({data: concatenatedTasmaxTimeseries})).toEqual({data: concatenatedTasmaxTimeseries});
    });
  });

  describe('getVariableOptions', function() {
    it('returns undefined for nonexistent variables', function () {
      expect(util.getVariableOptions('foo', 'bar')).toBeUndefined();
    });
    it('returns undefined for nonexistent options', function () {
      expect(util.getVariableOptions('tasmin', 'fuggle')).toBeUndefined();
    });
    it('returns the requested option', function () {
      expect(util.getVariableOptions('tasmin', 'decimalPrecision')).toBe(1);
    });
  });

  describe('timeKeyToTimeOfYear', function() {
    it('converts a time index into human-readable string', function () {
      expect(util.timeKeyToTimeOfYear(1)).toBe("February");
      expect(util.timeKeyToTimeOfYear(16)).toBe("Annual");
      expect(util.timeKeyToTimeOfYear(39)).toBe(undefined);
    });
  });

  describe('timeKeyToResolutionIndex', function () {
    it('converts a time index into a resolution / index pairing', function () {
      expect(util.timeKeyToResolutionIndex(0)).toEqual({timescale: "monthly", timeidx: 0});
      expect(util.timeKeyToResolutionIndex(16)).toEqual({timescale: "yearly", timeidx: 0});
      expect(util.timeKeyToResolutionIndex(13)).toEqual({timescale: "seasonal", timeidx: 1});
      expect(util.timeKeyToResolutionIndex(30)).toBe(undefined);
    });
  });

  describe('resolutionIndexToTimeKey', function () {
    it('converts a resolution/index pairing into a time index', function () {
      expect(util.resolutionIndexToTimeKey("monthly", 0)).toBe(0);
      expect(util.resolutionIndexToTimeKey("yearly", 0)).toBe(16);
      expect(util.resolutionIndexToTimeKey("seasonal", 1)).toBe(13);
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
    it('converts timestamps into monthly values', function () {
      expect(util.timestampToTimeOfYear("1977-07-15T00:00:00Z", "monthly", false)).toBe("July");
      expect(util.timestampToTimeOfYear("1977-04-15T00:00:00Z", "monthly", false)).toBe("April");
    });
    it('converts timestamps into seasonal values', function () {
      expect(util.timestampToTimeOfYear("1977-01-15T00:00:00Z", "seasonal", false)).toBe("Winter-DJF");
      expect(util.timestampToTimeOfYear("1977-04-15T00:00:00Z", "seasonal", false)).toBe("Spring-MAM");
      expect(util.timestampToTimeOfYear("1977-07-15T00:00:00Z", "seasonal", false)).toBe("Summer-JJA");
      expect(util.timestampToTimeOfYear("1977-10-15T00:00:00Z", "seasonal", false)).toBe("Fall-SON");
    });
    it('converts timestamps into annual values', function () {
      expect(util.timestampToTimeOfYear("1977-07-15T00:00:00Z", "yearly", true)).toBe("Annual 1977");
      expect(util.timestampToTimeOfYear("1977-04-15T00:00:00Z", "yearly", true)).toBe("Annual 1977");
    });
    it('does not convert unrecognized resolutions', function () {
      expect(util.timestampToTimeOfYear("1977-07-05T00:00:00Z", "daily", true)).toBe("1977-07-05T00:00:00Z");
    });
  });

  describe('timestampToYear', function () {
    it('extracts the year from ISO 8601 timestamps', function () {
      expect(util.timestampToYear("1977-01-01T11:32:12Z")).toBe("1977");
      expect(util.timestampToYear("2020-03-24")).toBe("2020");
    });
  });

  describe('sameYear', function () {
    it('checks if dates happen during the same celandar year', function () {
      expect(util.sameYear("1977-01-01T00:00:00Z", "1977-12-31T00:00:00Z")).toBeTruthy();
      expect(util.sameYear("1977-12-31T00:00:00Z", "1978-01-01T00:00:00Z")).not.toBeTruthy();
    });
  });

  describe('capitalizeWords', function () {
    it('capitalizes the first letter of each word in a string', function () {
      expect(util.capitalizeWords("initial lowercase string")).toBe("Initial Lowercase String");
      expect(util.capitalizeWords("Initial uppercase")).toBe("Initial Uppercase");
      expect(util.capitalizeWords("string number the 3rd")).toBe("String Number The 3rd");
    });
  });
  
  describe('caseInsensitiveStringSearch', function () {
    it('finds present substrings irrespective of case', function () {
      expect(util.caseInsensitiveStringSearch("category", "or")).toBeTruthy();
      expect(util.caseInsensitiveStringSearch("CATEGORY", "OR")).toBeTruthy();
      expect(util.caseInsensitiveStringSearch("category", "OR")).toBeTruthy();
      expect(util.caseInsensitiveStringSearch("CATEGORY", "or")).toBeTruthy();
      expect(util.caseInsensitiveStringSearch("cAtEgOrY", "oR")).toBeTruthy();
    });
    it('does not find nonexistant substrings', function () {
      expect(util.caseInsensitiveStringSearch("category", "and")).not.toBeTruthy();
      expect(util.caseInsensitiveStringSearch("CATEGORY", "AND")).not.toBeTruthy();
    });
  });

  describe('nestedAttributeIsDefined', function () {
    it('returns true when an attribute is defined', function () {
      expect(util.nestedAttributeIsDefined({attribute: 0}, "attribute")).toBe(true);
      expect(util.nestedAttributeIsDefined({attribute: {nested: 0}}, "attribute", "nested")).toBe(true);
    });
    it('returns false when an attribute is undefined', function () {
      expect(util.nestedAttributeIsDefined({}, "missing")).toBe(false);
      expect(util.nestedAttributeIsDefined({attribute: 0}, "missing")).toBe(false);
      expect(util.nestedAttributeIsDefined({attribute: {nested: 0}}, "attribute", "missing")).toBe(false);
    });
  });