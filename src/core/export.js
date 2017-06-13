var moment = require('moment/moment');
var _ = require('underscore');
import XLSX from 'xlsx';
import * as filesaver from 'filesaver.js';
import axios from 'axios';
import urljoin from 'url-join';

/*
 * Takes current data displayed in the DataTable, Annual Cycle graph, or
 * Projected Change graph, along with contextual data from user input, creates
 * an XLSX or CSV file, and serves it to the user for download. Draws on example
 * code from js-xlsx docs: https://github.com/SheetJS/js-xlsx
 */
var exportDataToWorksheet = function(datatype, metadata, data, format, timeidx) {
  // create workbook object containing one or more worksheets
  var wb = {
      Sheets: {},
      SheetNames: []
  };

  // prepare filename, metadata cells, and data cells according to type of export
  var summaryCells, dataCells, outputFilename;
  var filenamePrefix = "PCIC_CE_";
  var filenameInfix = "Export_" + metadata.model_id + "_" + metadata.experiment + "_" + metadata.variable_id;
  var filenameSuffix = "." + format;
  switch(datatype) {
    case "timeseries":
      summaryCells = createTimeSeriesWorksheetSummaryCells(metadata);
      dataCells = fillMultiTimeSeriesWorksheetDataCells(data, metadata);
      outputFilename = `${filenamePrefix}TimeSeries${filenameInfix}${filenameSuffix}`;
      break;
    case "stats":
      summaryCells = createWorksheetSummaryCells(metadata, timeIndexToTimeOfYear(timeidx));
      dataCells = fillWorksheetDataCells(data);
      outputFilename = `${filenamePrefix}StatsTable${filenameInfix}_${timeIndexToTimeOfYear(timeidx)}${filenameSuffix}`;
      break;
    case "climoseries":
      summaryCells = createWorksheetSummaryCells(metadata, timeIndexToTimeOfYear(timeidx));
      dataCells = fillClimoSeriesDataCells(data);
      outputFilename = `${filenamePrefix}ProjectedChange${filenameInfix}_${timeIndexToTimeOfYear(timeidx)}${filenameSuffix}`;
      break;
    case "single-timeseries":
      summaryCells = createTimeSeriesWorksheetSummaryCells(metadata);
      dataCells = fillSingleTimeSeriesWorksheetDataCells(data, metadata);
      outputFilename = `${filenamePrefix}TimeSeries${filenameInfix}${filenameSuffix}`;
      break;
  }

  // assemble the worksheet and add it to the workbook.
  // Note: sheetName will be truncated to 31 chars in
  // XLSX export to meet Excel limitation
  var ws = assembleWorksheet(summaryCells.concat([[]], dataCells));
  var sheetName = `${datatype}_${metadata.variable_id}`;
  wb.SheetNames.push(sheetName);
  wb.Sheets[sheetName] = ws;

  function xml_to_binary_string(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i <= s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  // format workbook for either csv or xlsx
  var out_data;
  if (format === 'csv') {
    out_data = new Blob(
        [XLSX.utils.sheet_to_csv(wb.Sheets[sheetName])],
        { type:'' }
        );
    }
  else if (format === 'xlsx') {
    var wbout = XLSX.write(wb, { bookType:'xlsx', bookSST:false, type: 'binary'});
    out_data = new Blob(
        [xml_to_binary_string(wbout)],
        { type:'' }
        );
  }
  // serve file for download
  filesaver.saveAs(out_data, outputFilename);
};

/*
 * Helper function for exportDataToWorksheet, creates summary rows that appear
 * at the top of the exported worksheet for exported stats table or Projected
 * Change data. Draws on example code from js-xlsx docs:
 * https://github.com/SheetJS/js-xlsx
 */
var createWorksheetSummaryCells = function (metadata, timeOfYear) {

  var rows = [];

  var header = ['Model', 'Emissions Scenario', 'Time of Year', 'Variable ID', 'Variable Name'];
  rows.push(header);

  rows.push([
    metadata.model_id,
    metadata.experiment,
    timeOfYear,
    metadata.variable_id,
    metadata.meta[0].variable_name
  ]);

  return rows;
};

/*
 * Helper function for exportDataToWorksheet, creates data column headers and
 * data entries for exported worksheet Draws on example code from js-xlsx docs:
 * https://github.com/SheetJS/js-xlsx
 */
var fillWorksheetDataCells = function (data) {

  var rows = _.map(data, function (stats) {
    return [stats.model_period, stats.run, stats.min, stats.max, stats.mean, stats.median, stats.stdev, stats.units];
  });

  var column_labels = ['Model Period', 'Run', 'Min', 'Max', 'Mean', 'Median', 'Std.Dev', 'Units'];
  rows.unshift(column_labels);

  return rows;
};

/*
 * Helper function for exportDataToWorksheet, combines summary rows, data column
 * headers, and data into one worksheet Draws on example code from js-xlsx docs:
 * https://github.com/SheetJS/js-xlsx
 */
var assembleWorksheet = function (cells) {
  var cell_ref;
  var ws = {};
  var maxCols = 0;
  cells.forEach(function (row, rowIndex) {
    if (row.length > maxCols) {
      maxCols = row.length;
    }
    row.forEach(function (cellValue, colIndex) {
      cell_ref = XLSX.utils.encode_cell({ c:colIndex, r:rowIndex });
      ws[cell_ref] = { v: cellValue, t: 's' };
    });
  });

    // set combined worksheet range bounds
  var range = {
    s: { c:0, r:0 },
    e: {
      c: maxCols - 1,
      r: cells.length - 1
    }
  };
  ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
};

var timeIndexToTimeOfYear = function (timeidx) {
    // convert timestep ID (0-16) to string format
  var timesOfYear = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December', 'Winter-DJF', 'Spring-MAM', 'Summer-JJA',
    'Fall-SON', 'Annual'
  ];
  return timesOfYear[timeidx];
};

/*
 * Helper function for exportDataToWorksheet that generates metadata / summary
 * cells for export of Annual Cycle data.
 */
var createTimeSeriesWorksheetSummaryCells = function (metadata) {

  var rows = [];

  var header = ['Model', 'Emissions Scenario', 'Variable ID', 'Variable Name'];
  rows.push(header);

  rows.push([
    metadata.model_id,
    metadata.experiment,
    metadata.variable_id,
    metadata.meta[0].variable_name,
  ]);

  return rows;
};

/*
 * Helper function for exportDataToWorksheet that generates data cells for
 * Projected Change climo series data.
 */
var fillClimoSeriesDataCells = function(data) {
  var timestamps = [];
  var rows = [];
  var column_labels = ['Run'];

  for(var run in data) {
    for(var time in data[run].data) {
      if(timestamps.indexOf(time) == -1) {
        timestamps.push(time);
      }
    }
  }
  for(time in timestamps.sort()) {
    column_labels.push(timestamps[time]);
  }
  column_labels.push("Units");

  for(var run in data) {
    var row = [run];
    for(time in timestamps.sort()) {
      row.push(data[run].data[timestamps[time]]);
    }
    row.push(data[run].units);
    rows.push(row);
  }
  rows.unshift(column_labels);
  return rows;
};

/*
 * Helper function for exportDataToWorksheet that generates data cells for
 * Annual Cycle export.
 */
var fillMultiTimeSeriesWorksheetDataCells = function(data, metadata) {
  var column_labels = ['Model Period', 'Run'];
  for(var i = 0; i < 12; i++) {
    column_labels.push(timeIndexToTimeOfYear(i));
  }
  column_labels.push("Units");

  var rows = _.map(data, function (run) {
    var runMetadata = metadata.meta.find(match => {return match.unique_id === run.id;});
    var row = [];
    row.push(inferPeriodFromTimeStamp(Object.keys(run.data)[0]));
    row.push(runMetadata.ensemble_member);
    var monthcount = 0;
    for(let key in run.data) {
      if(monthcount < 12) {
        row.push(run.data[key]);
      }
      monthcount++;
    }
    row.push(run.units);
    return row;
  });

  rows.unshift(column_labels);
  return rows;
};

/*
 * Helper function for exportDataToWorksheet that outputs only a single Annual Cycle
 * experimental run.
 * This is for use by the MOTI portal, where there's no way for a user to select
 * an individual run, climate explorer just selectes and displays one arbitrarily.
 * Question: would users of this period need or want run information at all?
 */

var fillSingleTimeSeriesWorksheetDataCells = function(data, metadata) {
  var runMetadata = metadata.meta.find(match => {return match.unique_id === data.id;});
  var rows = [];
  var column_labels = ['Model Period', 'Run'];
  for (var i = 0; i < 12; i++) {
    column_labels.push(timeIndexToTimeOfYear(i));
  }
  column_labels.push("Units");
  rows.push(column_labels);

  var row = [];
  row.push(inferPeriodFromTimeStamp(Object.keys(data.data)[0]));
  row.push(runMetadata.ensemble_member);
  var monthcount = 0;
  for(let key in data.data) {
    if(monthcount < 12) {
      row.push(data.data[key]);
    }
    monthcount++;
  }
  row.push(data.units);

  rows.push(row);
  return rows;
};

/* Helper function that returns period info (IE, 2010 - 2039)
 * based on the time stamp of associated data. Stopgap until the
 * API provides a safer version of this information.
 * Assumes all values are associated with the fifteenth year of
 * a thirty-year simulation period.
 */
//FIXME: Time period should be determined from the metadata API
// which currently doesn't give time bounds information. See here:
// https://github.com/pacificclimate/climate-explorer-backend/issues/44
// When that issue is fixed, this code needs to be updated
var inferPeriodFromTimeStamp = function (timestamp) {
  var year = parseInt(timestamp.slice(0, 4));
  return `${year - 15}-${year + 14}`;
};

module.exports = {exportDataToWorksheet,createWorksheetSummaryCells, fillWorksheetDataCells, assembleWorksheet,
    createTimeSeriesWorksheetSummaryCells, fillClimoSeriesDataCells, fillMultiTimeSeriesWorksheetDataCells,
    fillSingleTimeSeriesWorksheetDataCells};
