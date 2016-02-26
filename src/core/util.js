var moment = require("moment/moment");
var _ = require('underscore');
import XLSX from 'xlsx';
import * as filesaver from 'filesaver.js';

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
 *     eg: { '2025-04-16': 281.1234,
 *       '2055-04-16': 284.3456 }
 * Output:
 *  [ [ 'r1i1p1_xs', '2025-04-16', '2055-04-16' ],
 *    'r1i1p1', 281.12, 284.35 ] ]
 */
var genC3DataFromModel = function(name, data, unit, axisMap) {
  var axes = {};
  axes[name] = axisMap[unit];
  return {
    columns:[ [].concat(name, _.values(data)) ],
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
      yCount = 0,
      c3Axis = {},
      reverseMap = {}

  _.each(units, function(unit) {
    if (_.contains(seen, unit)) {
      return
    }

    var yLabel = Boolean(yCount) ? 'y' + yCount: 'y'
    c3Axis[yLabel] = {
      label: {
        position: 'outer-middle',
        text: unit
      },
      tick: {
        format: function(x) {
          return +x.toFixed(PRECISION);
        }
      }
    }
    reverseMap[unit] = yLabel
    yCount++;
    seen.push(unit);
  });

  return {
    axisData: c3Axis,
    unitsMap: reverseMap
  }
};

/*
 * Generates base x-axis information
 */
var generateXAxis = function(data) {
  return ['x'].concat(_.map(_.keys(data), function(d) {
    return moment(d, moment.ISO_8601).utc().format("YYYY-MM-DD")
  }))
};

/*
 * Sample input:
 * {"r1i1p1": {"units": "K", "data": {"2025-04-16T00:00:00Z": 281}}}
 */
var dataApiToC3 = function(data) {
  // Initialize the x axis data to the first
  var c3Data = {
    x: 'x',
    columns: [generateXAxis(data[Object.keys(data)[0]].data)],
    axes: {}
  }

  var c3AxisInfo = {
    x: {
      type: 'timeseries',
      tick: {
        format: '%Y-%m-%d'
      }
    }
  }

  var units = _.map(data, function(val, key) {
    return val.units;
  });
  _.extend(c3AxisInfo, generateAxisInfo(units).axisData);
  var unitsMap = generateAxisInfo(units).unitsMap;

  // NOTE: we have not found a way yet to display units if we have multiple axes of different
  // units/variable type (e.g. 'mm' and 'degrees_C'), as the tooltip option is applied globally across 
  // all chart series.  So for now we assume the keys of unitsMap are all the same (i.e. just 
  // one variable type is being displayed).
  var tooltipInfo = {
    grouped: true,
    format: {
      value: function (value) { return value.toFixed(PRECISION) + ' ' + _.keys(unitsMap)[0] }
    }
  };

  _.each(data, function(value, key) {
    c3Data = mergeC3Data(c3Data, genC3DataFromModel(key, value.data, value.units, unitsMap));
  })

  c3Data.columns.sort(function(a,b){
    return a[0] > b[0] ? 1 : -1;
  })

  return {
    data: c3Data,
    axis: c3AxisInfo,
    tooltip: tooltipInfo
  }
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
            'label': 
            {
              'text': yUnits,
              'position':'outer-middle',
            },
            tick: {
              format: function (x) { return +x.toFixed(PRECISION); }
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

  var model = 'Monthly Mean';
  var yUnits = graph_data['units'];

  var types = {
    'Annual Average': 'step',
    'Seasonal Average': 'step'
  };
  types[model] = 'line';

  var axes = {}; axes[model] = 'y';

  var C3Data = {
    columns:[],
    types: types,
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
    axes: axes,
  };

  var axisInfo = {
    x: { type:'category', categories:[] },
    y: { 
        label: { 'text': yUnits, 'position':'outer-middle' },
        tick: {
          format: function (x) { return +x.toFixed(PRECISION); }
        }  
      }
  };

  var tooltipInfo = {
    grouped: true,
    format: {
      value: function (value) { return value.toFixed(PRECISION) + ' ' + yUnits }
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
    var val = graph_data['data'][key];
    var timestep = moment(key, moment.ISO_8601).utc();
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

  return {
    data: C3Data,
    axis: axisInfo,
    tooltip: tooltipInfo
  };
}

/*
    Takes a multistats object of the following form and 
    1) flattens it, and
    2) rounds numeric values 
    for passing to the DataTable component for rendering:

    {
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
        ...
      }
    };
*/
var parseBootstrapTableData = function(data) {
    return _.map(data, function(stats, model) {
        var splitYears = model.split('_')[5].split('-');
        var period = splitYears[0].slice(0,4) + " - " + splitYears[1].slice(0,4);
        var modelInfo = {
            "model_period": period,
            "run": stats['run'],
            "min": +stats['min'].toFixed(PRECISION),
            "max": +stats['max'].toFixed(PRECISION),
            "mean": +stats['mean'].toFixed(PRECISION),
            "median": +stats['median'].toFixed(PRECISION),
            "stdev": +stats['stdev'].toFixed(PRECISION),
            "units": stats['units']
        };
        return modelInfo;
    });
}

/*
    Helper function for exportTableDataToWorksheet, creates summary rows that appear at the top of the exported worksheet
    Draws on example code from js-xlsx docs: https://github.com/SheetJS/js-xlsx 
*/
var createWorksheetSummaryCells = function(summary_data, time_of_year) {
    // store worksheet cell contents to be later encoded as per output format
    var cells = [];
    var cell;
    // write summary rows at top of worksheet
    var header = ["Model", "Emissions Scenario", "Time of Year", "Variable ID", "Variable Name"];
    var keys = ["model_id", "experiment", "time_of_year", "variable_id", "variable_name"];

    var num_rows = 3;
    var num_cols = keys.length

    for(var R = 0; R < num_rows; ++R) {
        for(var C = 0; C < num_cols; ++C) {
            if(R == 0) { 
              cell = {v: header[C]} 
            }
            else if(R == 1) {
                if(keys[C] == 'time_of_year') {
                  cell = {v: time_of_year};      
                }
                else { 
                  cell = {v: summary_data[keys[C]]} 
                }
            }
            else { 
              cell = {v: ""} 
            }
            cell.t = 's';
            cells.push(cell);
        }
    }
    return { 'num_rows': num_rows, 'num_cols': num_cols, 'cells': cells };
}

/*
    Helper function for exportTableDataToWorksheet, creates data column headers and data entries for exported worksheet
    Draws on example code from js-xlsx docs: https://github.com/SheetJS/js-xlsx 
*/
var fillWorksheetDataCells = function(data) {
    // store worksheet cell contents to be later encoded as per output format
    var cells = [];
    var cell;
    // populate worksheet with table data
    var column_labels = ["Model Period", "Run", "Min", "Max", "Mean", "Median", "Std.Dev", "Units" ];
    var data_keys = ["model_period", "run", "min", "max", "mean", "median", "stdev", "units" ];
    var num_data_rows = Object.keys(data).length + 1;
    var num_data_cols = data_keys.length

    for(var R = 0; R < num_data_rows; ++R) {
        for(var C = 0; C < num_data_cols; ++C) {
            // create header row
            if(R == 0) { 
              cell = {v: column_labels[C]} 
            }
            // create cell object: .v is the actual data
            else { 
              cell = {v: data[R-1][data_keys[C]]} 
            }
            if(cell.v === null) {
              continue;
            }
            // determine the cell type 
            if(typeof cell.v === 'number') { 
              cell.t = 'n' 
            }
            else { 
              cell.t = 's'
            }
            cells.push(cell);
        }
    }
    return { 'num_rows': num_data_rows, 'num_cols': num_data_cols, 'cells': cells };
}

/*
    Helper function for exportTableDataToWorksheet, combines summary rows, data column headers, and data into one worksheet
    Draws on example code from js-xlsx docs: https://github.com/SheetJS/js-xlsx 
*/
var assembleWorksheet = function (summary_cells, data_cells) {
    var R = 0;
    var C = 0;
    var cell;
    var cell_ref;
    var ws = {};

    for(R = 0; R < summary_cells.num_rows; ++R) {
        for(C = 0; C < summary_cells.num_cols; ++C) {
            cell_ref = XLSX.utils.encode_cell({c:C,r:R});
            ws[cell_ref] = summary_cells.cells[(R * summary_cells.num_cols) + C];
        }
    }
    for(var data_row = 0; data_row < data_cells.num_rows; ++data_row) {
        for(var data_col = 0; data_col < data_cells.num_cols; ++data_col) {
            cell_ref = XLSX.utils.encode_cell({c:data_col,r:R+data_row});
            ws[cell_ref] = data_cells.cells[(data_row * data_cells.num_cols) + data_col];
        }
    }
    // set combined worksheet range bounds
    var range = {
      s: {c:0, r:0}, 
      e: {
          c: (summary_cells.num_cols > data_cells.num_cols ? summary_cells.num_cols : data_cells.num_cols), 
          r: summary_cells.num_rows + data_cells.num_rows + 1}};
    ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

/*
    Takes current data displayed in the DataTable and contextual data from user input, 
    creates an XLSX or CSV file, and serves it to the user for download.
    Draws on example code from js-xlsx docs: https://github.com/SheetJS/js-xlsx 
*/
var exportTableDataToWorksheet = function(data, format, time_of_year) {
    // create workbook object containing one or more worksheets
    var wb = {
    Sheets: {},
    SheetNames: []
    };

    // convert timestep ID (0-16) to string format
    var times_of_year = ["January", "February", "March", "April", "May", "June", "July", "August", "September", 
                      "October", "November", "December", "Winter - DJF", "Spring - MAM", "Summer - JJA", 
                      "Fall - SON", "Annual"];
    // var time_of_year = times_of_year[this.state.dataTableTimeOfYear];

    // prepare summary cells
    var summary_cells = createWorksheetSummaryCells(this.props, time_of_year);

    // if time_of_year is a season, overwrite it with a short version label for use in output filename (e.g. "Summer - JJA" -> "Summer")
    var short_season_label = time_of_year.substr(0, time_of_year.indexOf(' ')); // will return string before whitespace
    if(short_season_label) time_of_year = short_season_label;

    // prepare data cells
    var data_cells = fillWorksheetDataCells(data);

    // assemble summary_cells and data_cells into one XLSX-encoded worksheet
    var ws = assembleWorksheet(summary_cells, data_cells);

    // add worksheet to workbook. Note: ws_name will be truncated to 31 chars in XLSX export to meet Excel limitation
    var ws_name = "Stats_Table_" + this.props.variable_id + "_" + time_of_year;
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    // Note: we will probably want to split the rest of this out into a separate function 
    // to combine multiple worksheets if/when we want to export additional data (e.g. DataGraph points)
    function to_csv(workbook) {
        var result = [];
        workbook.SheetNames.forEach(function(sheetName) {
            var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
            if(csv.length > 0){
                // Uncomment the following 2 lines of code to support multiple worksheets
                // result.push("SHEET: " + sheetName);
                // result.push("");
                result.push(csv);
            }
        });
        return result.join("\n");
    }

    function xml_to_binary_string(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    var out_data;
    if(format == 'csv'){
        out_data = new Blob([to_csv(wb)],{type:""});
    }
    else if(format == 'xlsx') { 
        // convert workbook to XLSX and prepare for download
        var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:false, type: 'binary'});
        out_data = new Blob([xml_to_binary_string(wbout)],{type:""});
    }
    // form output filename
    var output_filename = "PCIC_CE_StatsTableExport_" + this.props.model_id + "_" + this.props.experiment + 
                            "_" + this.props.variable_id + "_" + time_of_year + "." + format;
    // serve up file for download
    filesaver.saveAs(out_data, output_filename);
}

module.exports = { parseDataForC3, parseTimeSeriesForC3, dataApiToC3, parseBootstrapTableData, 
    createWorksheetSummaryCells, fillWorksheetDataCells, assembleWorksheet, exportTableDataToWorksheet }
