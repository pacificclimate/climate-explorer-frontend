jest.dontMock('../util');

const testData = {
    "model_id1": {
        "min": 10.0,
        "max": 40.0,
        "mean": 23.0,
        "median": 25.0,
        "stdev": 2.0,
        "units": "degC change"
    },
    "model_id2": {
        "min": 5.0,
        "max": 30.0,
        "mean": 15.0,
        "median": 18.0,
        "stdev": 1.5,
        "units": "degC change"
    }
};

const outputData = [
    {"model_id": "model_id1",
    "min": 10.0,
    "max": 40.0,
    "mean": 23.0,
    "median": 25.0,
    "stdev": 2.0,
    "units": "degC change"
    },
    {
    "model_id": "model_id2",
    "min": 5.0,
    "max": 30.0,
    "mean": 15.0,
    "median": 18.0,
    "stdev": 1.5,
    "units": "degC change"
    }
];

describe('parseBootstrapTableData', function() {
    it('Correctly flattens a stats object', function() {
        var parseBootstrapTableData = require('../util');
        expect(parseBootstrapTableData(testData)).toEqual(outputData);
    });
});