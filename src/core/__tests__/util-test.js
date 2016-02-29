jest.dontMock('../util');
jest.dontMock('underscore');
jest.dontMock('xlsx');

var _ = require('underscore');
var xlsx = require('xlsx');

const testData = {
  model_id1: {
    units: 'degC',
    data: {
      2050: 21.0,
      2080: 35.0,
      2020: 11.0
    }
  },
  model_id2: {
    units: 'mm',
    data: {
      2050: 240.0,
      2020: 300.0
    }
  }
};

const outputC3Data = {
  'xs': {
    'model_id1': 'model_id1_xs',
    'model_id2': 'model_id2_xs'
  },
  'columns':[
    ['model_id1_xs', '2020', '2050', '2080'],
    ['model_id1', 11.0, 21.0, 35.0],
    ['model_id2_xs', '2020', '2050'],
    ['model_id2', 300, 240]
  ],
  'axes':{
    'model_id1': 'y1',
    'model_id2': 'y2'
  }
};

const outputC3DataAxisInfo = {
  'y1': {
    'label': {
      'position': 'outer-middle',
      'text': 'degC'
    },
    'show': true
  },
  'y2': {
    'label': {
      'position': 'outer-middle',
      'text': 'mm'
    },
    'show': true
  }
};

describe('parseDataForC3', function() {
  var parseDataForC3 = require('../util').dataApiToC3;
  // it('Correctly parses a JSON object with average data from multiple models for plotting with C3', function() {

  //   var result = parseDataForC3(testData);
  //   var expected = [outputC3Data, outputC3DataAxisInfo];

  //   expect(result).toEqual(expected);

  // });

  xit('can handle a minimum data set', function() {
    var input = {
      'r1i1p1': {
        'data': {
          '2025-01-16T00:00:00Z': 275,
          '2025-02-16T00:00:00Z': 280,
        },
        'units': 'K'
      }
    }
    var expected = {
      data: {
        columns: [ ['x', '2025-01-16', '2025-02-16'],
                   ['r1i1p1', 275, 280] ],
        x: 'x',
        axes: {
          r1i1p1: 'y'
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y-%m-%d'
          }
        },
        y: {
          label: {
            position: 'outer-middle',
            text: 'K'
          }
        }
      }
    }

    var result = parseDataForC3(input);

    expect(result).toEqual(expected);
  });
});

const testTimeSeries = {
  'id': 'tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231',
  'units': 'K',
  'data': {'1986-01-16T00:00:00Z': 275.75720932904414,
      '1986-02-15T00:00:00Z': 273.4294128417969,
      '1986-03-16T00:00:00Z': 273.4919128417969,
      '1986-04-16T00:00:00Z': 274.8638610839844,
      '1986-05-16T00:00:00Z': 276.67352294921875,
      '1986-06-16T00:00:00Z': 278.1564025878906,
      '1986-07-16T00:00:00Z': 278.5601501464844,
      '1986-08-16T00:00:00Z': 278.06195068359375,
      '1986-09-16T00:00:00Z': 276.9363098144531,
      '1986-10-16T00:00:00Z': 275.7844543457031,
      '1986-11-16T00:00:00Z': 274.8958740234375,
      '1986-12-16T00:00:00Z': 274.33758544921875,
      '1986-04-17T00:00:00Z': 273.89501953125,
      '1986-07-17T00:00:00Z': 275.0113525390625,
      '1986-10-17T00:00:00Z': 278.2606201171875,
      '1987-01-15T00:00:00Z': 275.8712158203125,
      '1986-07-02T00:00:00Z': 275.76947021484375
    }
};

const outputC3TimeSeries = {
  columns:[
    [
      'Monthly Mean',
      275.75720932904414, 273.4294128417969, 273.4919128417969, 274.8638610839844, 276.67352294921875, 278.1564025878906, 278.5601501464844,
      278.06195068359375, 276.9363098144531, 275.7844543457031, 274.8958740234375, 274.33758544921875
    ], [
      'Seasonal Average',
      273.89501953125, 273.89501953125, 275.0113525390625, 275.0113525390625, 275.0113525390625, 278.2606201171875,
      278.2606201171875, 278.2606201171875, 275.8712158203125, 275.8712158203125, 275.8712158203125, 273.89501953125
    ], [
      'Annual Average',
      275.76947021484375, 275.76947021484375, 275.76947021484375, 275.76947021484375, 275.76947021484375, 275.76947021484375,
      275.76947021484375, 275.76947021484375, 275.76947021484375, 275.76947021484375, 275.76947021484375, 275.76947021484375
      ]
    ],
    // types: {
    //   model: 'line',
    //   'Annual Average': 'step',
    //   'Seasonal Average': 'step'
    // },
    // labels: {
    //   format: {
    //     'Seasonal Average': function (v, id, i, j){
    //       if (i == 0 || i == 11){ return "Winter" }
    //       if (i == 3) { return "Spring" }
    //       if (i == 6) { return "Summer" }
    //       if (i == 9) { return "Fall" }
    //     }
    //   }
    // },
    // axes: {model:'y'},
};

const outputC3TimeSeriesAxisInfo = { 
  x: { type:'category',
    categories:['January', 'February', 'March', 'April', 'May',
          'June', 'July', 'August', 'September', 'October',
          'November', 'December']
  },
  y: { label: { 'text': 'K', 'position':'outer-middle' }}
};

const outputC3TimeSeriesTooltipInfo = {
  grouped: true,
  format: {
    value: function (value) { return value + ' ' + 'K' }
  }
};

describe('parseTimeSeriesForC3', function() {
  it('Correctly parses a JSON object with time series data from one model for plotting with C3', function() {
    var parseTimeSeriesForC3 = require('../util').parseTimeSeriesForC3;

    var result = parseTimeSeriesForC3(testTimeSeries);

    expect(result.data.columns).toEqual(outputC3TimeSeries.columns);

  });
});

const bootstrapTableTestData = {
  'tasmin_Amon_CanESM2_historical_r1i1p1_19610101-19901231': 
  {
    'median': 278.34326171875,
    'min': 225.05545043945312,
    'units': 'K',
    'mean': 273.56732177734375,
    'max': 303.601318359375,
    'ncells': 8192,
    'stdev': 22.509726901403784,
    'run': 'r1i1p1'
  },
  'tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231': 
  {
    'median': 278.4786682128906,
    'min': 225.04750061035156,
    'units': 'K',
    'mean': 273.87298583984375,
    'max': 303.7774963378906,
    'ncells': 8192,
    'stdev': 22.323802147796965,
    'run': 'r1i1p1'
  }
};

const bootstrapTableTestExpected = [
    {
    'run': 'r1i1p1',
    'min': 225.06,
    'max': 303.60,
    'mean': 273.57,
    'median': 278.34,
    'stdev': 22.51,
    'units': 'K',
    'model_period': '1961 - 1990'
    },
    {
    'run': 'r1i1p1',
    'min': 225.05,
    'max': 303.78,
    'mean': 273.87,
    'median': 278.48,
    'stdev': 22.32,
    'units': 'K',
    'model_period': '1971 - 2000'
    }
];

describe('parseBootstrapTableData', function() {
    it('Correctly flattens a stats object for passing to the DataTable component', function() {
        var util = require('../util');
        var result = util.parseBootstrapTableData(bootstrapTableTestData);
        expect(result).toEqual(bootstrapTableTestExpected);
    });
});

const worksheetSummaryData = { model_id: 'CSIRO-Mk3-6-0', variable_id: 'pr', experiment: 'rcp26', variable_name: 'Precipitation' }
const worksheetTimeOfYear = 'Winter-DJF'
const worksheetSummaryCellsExpected = { 
    0: { 
        0: 'Model',
        1: 'Emissions Scenario',
        2: 'Time of Year',
        3: 'Variable ID',
        4: 'Variable Name'
    },
    1: { 
        0: 'CSIRO-Mk3-6-0',
        1: 'rcp26',
        2: 'Winter-DJF',
        3: 'pr',
        4: 'Precipitation'
    }
}

const worksheetTestData = [
        { model_period: '2040 - 2069', run: 'r1i1p1', min: 0, max: 22.08, mean: 2.34, median: 1.34, stdev: 3.01, units: 'mm' }, 
        { model_period: '2070 - 2099', run: 'r1i1p1', min: 0, max: 22.66, mean: 2.36, median: 1.39, stdev: 2.97, units: 'mm' },
        { model_period: '2010 - 2039', run: 'r1i1p1', min: 0, max: 21.97, mean: 2.31, median: 1.35, stdev: 2.94, units: 'mm' }
    ]
const worksheetDataRowsExpected = [
    ['Model Period', 'Run', 'Min', 'Max', 'Mean', 'Median', 'Std.Dev', 'Units' ],
    ['2040 - 2069', 'r1i1p1', 0, 22.08, 2.34, 1.34, 3.01, 'mm' ], 
    ['2070 - 2099', 'r1i1p1', 0, 22.66, 2.36, 1.39, 2.97, 'mm' ],
    ['2010 - 2039', 'r1i1p1', 0, 21.97, 2.31, 1.35, 2.94, 'mm']
]

const worksheetRange = 'A1:H7';

describe('createWorksheetSummaryCells', function() {
    it('Correctly forms worksheet summary cells', function() {
        var util = require('../util');
        var result = util.createWorksheetSummaryCells(worksheetSummaryData, worksheetTimeOfYear);
        expect(result).toEqual(worksheetSummaryCellsExpected);
    });
});

describe('fillWorksheetDataRows', function() {
    it('Correctly fills worksheet data cells', function() {
        var util = require('../util');
        var result = util.fillWorksheetDataCells(worksheetTestData);
        expect(result).toEqual(worksheetDataRowsExpected);
    });
});

describe('assembleWorksheet', function() {
    it('Correctly assembles worksheet from summary and data cells', function() {
        var util = require('../util');
        var summary_cells = util.createWorksheetSummaryCells(worksheetSummaryData, worksheetTimeOfYear);
        var data_cells = util.fillWorksheetDataCells(worksheetTestData);
        var ws = util.assembleWorksheet(summary_cells.concat([[]], data_cells));
        expect(ws['!ref']).toEqual(worksheetRange);
    });
});