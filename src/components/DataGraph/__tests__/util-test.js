jest.dontMock('../util');
jest.dontMock('underscore');

var _ = require('underscore');
var util = require('util');


const testData = {
    "model_id1": {
        "units": "degC",
        "2050": 21.0,
        "2080": 35.0,
        "2020": 11.0
    },
    "model_id2": {
        "units": "mm",
        "2050": 240.0,
        "2020": 300.0  
    }
};

const outputModelsData = {
    'xs': {
        "model_id1_data": "model_id1_xs",
        "model_id2_data": "model_id2_xs"
    },
    'columns':[
        ["model_id1_xs", "2020", "2050", "2080"],
        ["model_id1_data", 11.0, 21.0, 35.0],
        ["model_id2_xs", "2020", "2050"],
        ["model_id2_data", 300, 240]
    ],
    'axes':{
        "model_id1_data": "y",
        "model_id2_data": "y2"
    }
};

const outputAxisInfo = {
    'y': {
        'label': {
            'position': 'outer-center',
            'text': 'degC'
        },
        'show': true
    },
    'y2': {
        'label': {
            'position': 'outer-center',
            'text': 'mm'
        },
        'show': true
    }
};

describe('parseC3Data', function() {
    it('Correctly parses a JSON object with data from multiple models for plotting with C3', function() {
        var parseC3Data = require('../util');

        var result = parseC3Data(testData);
        var expected = [outputModelsData, outputAxisInfo];

        // including console logs here because the order that parseC3Data steps through 
        // models within the original testData object is not predictable
        // console.log(util.inspect(expected, false, null));
        // console.log('########################');
        // console.log(util.inspect(result, false, null));

        var res = _.isEqual(result, expected);
        expect(res).toEqual(true);

    });
});