jest.dontMock('../util');

const testData = {
  "tasmin_Amon_CanESM2_historical_r1i1p1_19610101-19901231": 
  {
    "median": 278.34326171875,
    "min": 225.05545043945312,
    "units": "K",
    "mean": 273.56732177734375,
    "max": 303.601318359375,
    "time": "1977-07-15T21:10:35Z",
    "ncells": 8192,
    "stdev": 22.509726901403784
  },
  "tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231": 
  {
    "median": 278.4786682128906,
    "min": 225.04750061035156,
    "units": "K",
    "mean": 273.87298583984375,
    "max": 303.7774963378906,
    "time": "1986-07-15T21:10:35Z",
    "ncells": 8192,
    "stdev": 22.323802147796965
  }
};

const expected = [
    {"model_id": "tasmin_Amon_CanESM2_historical_r1i1p1_19610101-19901231",
    "min": 225.06,
    "max": 303.60,
    "mean": 273.57,
    "median": 278.34,
    "stdev": 22.51,
    "units": "K",
    "time": "1961 - 1990"
    },
    {
    "model_id": "tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231",
    "min": 225.05,
    "max": 303.78,
    "mean": 273.87,
    "median": 278.48,
    "stdev": 22.32,
    "units": "K",
    "time": "1971 - 2000"
    }
];

describe('parseBootstrapTableData', function() {
    it('Correctly flattens a stats object', function() {
        var parseBootstrapTableData = require('../util');
        var result = parseBootstrapTableData(testData);
        expect(result).toEqual(expected);
    });
});