var moment = require("moment/moment");
var _ = require('underscore');

// set the decimal precision of displayed values
var PRECISION = 2;

/*
 * Merges new data into an existing C3 formatted data object
 */
var mergeC3Data = function(old, toAdd) {
  _.extend(old.xs, toAdd.xs);
  old.columns = old.columns.concat(toAdd.columns);
  _.extend(old.axes, toAdd.axes);
  return old
}


/*
 * Formats a single entry from a Climate Explorer `data` api call
 * into C3 compatible input
 *
 * Input:
 *   @param name: Run name
 *     eg: r1i1p1
 *   @param data: Js object of {timeval: result}
 *     eg: { '2025-04-16': 281,
 *       '2055-04-16': 284 }
 * Output:
 *  [ [ 'r1i1p1_xs', '2025-04-16', '2055-04-16' ],
 *    'r1i1p1', 281, 284 ] ]
 */
var genC3DataFromModel = function(name, data, unit, axisMap) {
  var xs = {},
    axes = {};
  xs[name] = name.concat('_xs');
  axes[name] = axisMap[unit];
  return {
    xs: xs,
    columns:[ [].concat(name.concat('_xs'), _.keys(data)),
          [].concat(name, _.values(data)) ],
    axes: axes
  }
};

/*
 * Generates a C3 compatible 'axis' object
 *
 * Returns an object with keys containing the c3 axis data
 * and a reverse unit to y axis label map
 *
 */
var generateAxisInfo = function(units) {
  var seen = [],
      yCount = 1,
      c3Axis = {},
      reverseMap = {}

  _.each(units, function(unit) {
    if (_.contains(seen, unit)) {
      return
    }

    var yLabel = 'y' + yCount
    c3Axis[yLabel] = {
      label: {
        position: 'outer-middle',
        text: unit
      },
      show: true
    }
    reverseMap[unit] = yLabel
    yCount++;
  });

  return {
    axisData: c3Axis,
    unitsMap: reverseMap
  }
};

/*
 * Sample input:
 * {"r1i1p1": {"units": "K", "data": {"2025-04-16T00:00:00Z": 281}}}
 */
var dataApiToC3 = function(data) {
  var c3Data = {
    xs: {},
    columns: [],
    axes: {}
  }

  var units = _.map(data, function(val, key) {
    return val.units;
  });
  var c3AxisInfo = generateAxisInfo(units).axisData;
  var unitsMap = generateAxisInfo(units).unitsMap;

  _.each(data, function(value, key) {
    c3Data = mergeC3Data(c3Data, genC3DataFromModel(key, value.data, value.units, unitsMap));
  })
  return [c3Data, c3AxisInfo]
}


var parseDataForC3 = function(data) {
  var allModelsData = {xs:{}, columns:[], axes:{}};
  var axisInfo = {};

  for (let model in data) {
    var dataSeries = [model];
    var xLabel = model.concat("_xs");
    var xSeries = [xLabel];
    var yUnits;
    var yAxisCount; // to accommodate plotting multiple climate variables
    allModelsData['xs'][model] = xLabel;
    for (let key in data[model]) {
      var val = data[model][key];
      if (parseInt(key)) { // this is a time series value
        xSeries.push(key);
        dataSeries.push(val);
      }
      else { // this is the units of the series, which also defines the y axes
        if (key === 'units' && data[model][key] !== yUnits) { // don't create redundant axes
          yUnits = String(data[model][key]);
          var modelYaxisLabel = yAxisCount ? "y".concat(yAxisCount) : "y";

          allModelsData['axes'][model] = modelYaxisLabel;
          axisInfo[modelYaxisLabel] = {
            'show': true,
            'label': {
              'text': yUnits,
              'position':'outer-middle',
            }
          };
          if (!yAxisCount){ // C3 wants y-axes labeled 'y', 'y2', 'y3'...
            yAxisCount = 1;
          }
          yAxisCount++;
        }
      }
    }
    allModelsData['columns'].push(xSeries);
    allModelsData['columns'].push(dataSeries);
  }
  return [allModelsData, axisInfo];
}


var parseTimeSeriesForC3 = function(graph_data) {

  var model = graph_data['id'];
  var yUnits = graph_data['units'];
  var C3Data = {
    columns:[],
    types: {
      model: 'line',
      'Annual Average': 'step',
      'Seasonal Average': 'step'
    },
    labels: {
      format: {
        'Seasonal Average': function (v, id, i, j){
          if (i == 0 || i == 11){ return "Winter" }
          if (i == 3) { return "Spring" }
          if (i == 6) { return "Summer" }
          if (i == 9) { return "Fall" }
        }
      }
    },
    axes: {model:'y'},
  };

  var axisInfo = {
    x: { type:'category', categories:[] },
    y: { label: { 'text': yUnits, 'position':'outer-middle' }}
  };

  var tooltipInfo = {
    grouped: true,
    format: {
      value: function (value) { return value + ' ' + yUnits }
    }
  };

  var monthlySeries = [model];
  var springSeries = [];
  var summerSeries = [];
  var fallSeries = [];
  var winterSeries = [];
  var seasonalLabel = ['Seasonal Average'];
  var annualSeries = ['Annual Average'];

  var idx = 0;
  for (let key in graph_data['data']) {
    var val = graph_data['data'][key].toFixed(PRECISION);
    var timestep = moment(key, moment.ISO_8601);
    var month = timestep.format('MMMM');
    if (idx < 12){
      axisInfo['x']['categories'].push(month);
      monthlySeries.push(val);
    }
    else if (idx === 12){
      winterSeries.push(val, val, val);
    }
    else if (idx === 13){
      springSeries.push(val, val, val);
    }
    else if (idx === 14){
      summerSeries.push(val, val, val);
    }
    else if (idx === 15){
      fallSeries.push(val, val, val);
    }
    else if (idx === 16){
      annualSeries = annualSeries.concat(_.times(12, function(){return this}, val));
    }
    idx++;
  }
  C3Data['columns'].push(monthlySeries);
  // Form series for seasonal lines
  var seasonalSeries = seasonalLabel.concat(winterSeries.slice(-2),springSeries,summerSeries,fallSeries,winterSeries.slice(0,1));
  C3Data['columns'].push(seasonalSeries);
  C3Data['columns'].push(annualSeries);

  return [C3Data, axisInfo, tooltipInfo];
}

module.exports = { parseDataForC3, parseTimeSeriesForC3, dataApiToC3 }
