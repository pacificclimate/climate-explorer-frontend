jest.dontMock('../../../core/util');

const testData = {
  "tasmin_Amon_CanESM2_historical_r1i1p1_19610101-19901231": 
  {
    "median": 278.34326171875,
    "min": 225.05545043945312,
    "units": "K",
    "mean": 273.56732177734375,
    "max": 303.601318359375,
    "ncells": 8192,
    "stdev": 22.509726901403784,
    "run": "r1i1p1"
  },
  "tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231": 
  {
    "median": 278.4786682128906,
    "min": 225.04750061035156,
    "units": "K",
    "mean": 273.87298583984375,
    "max": 303.7774963378906,
    "ncells": 8192,
    "stdev": 22.323802147796965,
    "run": "r1i1p1"
  }
};

const expected = [
    {
    "run": "r1i1p1",
    "min": 225.06,
    "max": 303.60,
    "w_mean": 273.57,
    "median": 278.34,
    "w_stdev": 22.51,
    "units": "K",
    "model_period": "1961 - 1990"
    },
    {
    "run": "r1i1p1",
    "min": 225.05,
    "max": 303.78,
    "w_mean": 273.87,
    "median": 278.48,
    "w_stdev": 22.32,
    "units": "K",
    "model_period": "1971 - 2000"
    }
];

describe('parseBootstrapTableData', function() {
    it('Correctly flattens a stats object', function() {
        var util = require('../../../core/util');
        var result = util.parseBootstrapTableData(testData);
        expect(result).toEqual(expected);
    });
});