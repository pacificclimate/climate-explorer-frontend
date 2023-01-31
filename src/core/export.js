/*******************************************************************
 * export.js - functions for writing data to a CSV or XLSX file
 *
 * The main function in this file is exportDataToWorksheet; the
 * other functions are helper functions that create pieces
 * (headers, data) of the exported file.
 *
 * Built around the js-xlsx library
 *******************************************************************/

import _ from "lodash";
import XLSX from "xlsx/xlsx.js";
import * as filesaver from "filesaver.js";
import {
  timeResolutionIndexToTimeOfYear,
  PRECISION,
  getVariableOptions,
} from "./util";

/************************************************************
 * 0. exportDataToWorksheet() - the main export function
 ************************************************************/

/*
 * Takes current data displayed in the DataTable, Annual Cycle graph, or
 * Long Term Average graph, along with contextual data from user input, creates
 * an XLSX or CSV file, and serves it to the user for download. Draws on example
 * code from js-xlsx docs: https://github.com/SheetJS/js-xlsx
 *
 * Arguments:
 * datatype: a string, either "timeseries", "stats", or "climoseries"
 * metadata: object with the attributes used to generate the data being
 *     exported: model, emissions scenario, variables(s)
 * data: either a data table or a graph data object
 * format: string indicating file format: "csv" or "xlsx"
 * selection: object indicating which slice of data being exported, either
 *     1. a specific climatology and run (for an annual cycle graph)
 *     2. time of year (for stats or change graph)
 */
var exportDataToWorksheet = function (
  datatype,
  metadata,
  data,
  format,
  selection,
) {
  // create workbook object containing one or more worksheets
  var wb = {
    Sheets: {},
    SheetNames: [],
  };

  var timeOfYear = "";
  var variable = metadata.variable_id;

  // prepare filename, metadata cells, and data cells according to type of export
  var summaryCells, dataCells, outputFilename;
  var filenamePrefix = "PCIC_CE_";
  var filenameInfix = `Export_${metadata.model_id}_${metadata.experiment}_${variable}`;
  var filenameSuffix = "." + format;
  switch (datatype) {
    case "timeseries":
      summaryCells = createTimeseriesWorksheetSummaryCells(metadata, selection);
      dataCells = generateDataCellsFromC3Graph(data, "Time Series", variable);
      outputFilename = `${filenamePrefix}Timeseries${filenameInfix}${filenameSuffix}`;
      break;
    case "stats":
      timeOfYear = timeResolutionIndexToTimeOfYear(
        selection.timescale,
        selection.timeidx,
      );
      summaryCells = createWorksheetSummaryCells(metadata, timeOfYear);
      dataCells = generateDataCellsFromDataTable(data, "Time Series", variable);
      outputFilename = `${filenamePrefix}StatsTable${filenameInfix}_${timeOfYear}${filenameSuffix}`;
      break;
    case "climoseries":
      timeOfYear = timeResolutionIndexToTimeOfYear(
        selection.timescale,
        selection.timeidx,
      );
      summaryCells = createWorksheetSummaryCells(metadata, timeOfYear);
      dataCells = generateDataCellsFromC3Graph(data, "Run", variable);
      outputFilename = `${filenamePrefix}LongTermAverage${filenameInfix}_${timeOfYear}${filenameSuffix}`;
      break;
    case "raw_timeseries":
      timeOfYear = "Annual";
      summaryCells = createWorksheetSummaryCells(metadata, timeOfYear);
      dataCells = generateDataCellsFromC3Graph(data, "Time Series", variable);
      outputFilename = `${filenamePrefix}RawTimeseries${filenameInfix}_${timeOfYear}${filenameSuffix}`;
      break;
  }

  // assemble the worksheet and add it to the workbook.
  // Note: sheetName will be truncated to 31 chars in
  // XLSX export to meet Excel limitation
  var ws = assembleWorksheet(summaryCells.concat([[]], dataCells));
  var sheetName = `${datatype}_${variable}`;
  wb.SheetNames.push(sheetName);
  wb.Sheets[sheetName] = ws;

  //function to generate binary string encodings required by XLSX format
  //(not used for CSV format)
  function xml_to_binary_string(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i <= s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  // format workbook for either csv or xlsx
  var out_data;
  switch (format) {
    case "csv":
      out_data = new Blob([XLSX.utils.sheet_to_csv(wb.Sheets[sheetName])], {
        type: "",
      });
      break;

    case "xlsx":
      var wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: false,
        type: "binary",
      });
      out_data = new Blob([xml_to_binary_string(wbout)], { type: "" });
      break;

    default:
      throw new Error(`Unknown export format: '${format}'`);
  }

  // serve file for download
  filesaver.saveAs(out_data, outputFilename);
};

/*********************************************************
 * 1. summary-generating functions that create cells
 * containing the metadata needed to describe the exported
 * data
 *********************************************************/

/*
 * Helper function for exportDataToWorksheet, creates summary rows that appear
 * at the top of the exported worksheet for exported stats table or Long Term
 * Average data. Draws on example code from js-xlsx docs:
 * https://github.com/SheetJS/js-xlsx
 */
var createWorksheetSummaryCells = function (metadata, timeOfYear) {
  var rows = [];

  var header = [
    "Model",
    "Emissions Scenario",
    "Time of Year",
    "Variable ID",
    "Variable Name",
  ];

  var values = [
    metadata.model_id,
    metadata.experiment,
    timeOfYear,
    metadata.variable_id,
    metadata.meta[0].variable_name,
  ];

  //provide metadata for a second variable, if one is in use.
  if (metadata.comparand_id && metadata.comparand_id !== metadata.variable_id) {
    header.push("Comparand ID");
    header.push("Comparand Name");
    values.push(metadata.comparand_id);
    values.push(metadata.comparandMeta[0].variable_name);
  }

  rows.push(header);
  rows.push(values);

  return rows;
};

/*
 * Helper function for exportDataToWorksheet that generates metadata / summary
 * cells for export of Annual Cycle data.
 */
var createTimeseriesWorksheetSummaryCells = function (metadata, dataSpec) {
  var rows = [];
  var header = [
    "Model",
    "Emissions Scenario",
    "Period",
    "Run",
    "Variable ID",
    "Variable Name",
  ];

  var values = [
    metadata.model_id,
    metadata.experiment,
    `${dataSpec.start_date}-${dataSpec.end_date}`,
    dataSpec.ensemble_member,
    metadata.variable_id,
    metadata.meta[0].variable_name,
  ];

  //provide metadata for a second variable, if one is in use.
  if (metadata.comparand_id && metadata.comparand_id !== metadata.variable_id) {
    header.push("Comparand ID");
    header.push("Comparand Name");
    values.push(metadata.comparand_id);
    values.push(metadata.comparandMeta[0].variable_name);
  }

  rows.push(header);
  rows.push(values);

  return rows;
};

/************************************************************
 * 2. data-generating functions that create cells containing
 * the requested data for export
 ************************************************************/

/*
 * Helper function for exportDataToWorksheet, creates data column headers and
 * data entries for exported worksheet Draws on example code from js-xlsx docs:
 * https://github.com/SheetJS/js-xlsx
 */
var generateDataCellsFromDataTable = function (data) {
  var rows = _.map(data, function (stats) {
    return [
      stats.model_period,
      stats.run,
      stats.min,
      stats.max,
      stats.mean,
      stats.median,
      stats.stdev,
      stats.units,
    ];
  });

  var column_labels = [
    "Model Period",
    "Run",
    "Min",
    "Max",
    "Mean",
    "Median",
    "Std.Dev",
    "Units",
  ];
  rows.unshift(column_labels);

  return rows;
};

/*
 * Helper function for exportDataToWorksheet that generates data table cells from
 * a C3 graph configuration object.
 */
var generateDataCellsFromC3Graph = function (
  graph,
  seriesLabel = "Time Series",
  variable = "",
) {
  var rows = [];
  var column_labels = [seriesLabel];

  //This could be either a graph with a categorical x-axis, or a numerical
  //x-axis. The C3 structure is slightly different.
  //Numerical values are treated by C3 as data, categorical as axis metadata.
  var graphHasCategoricalXAxis = graph.axis.x.type === "category";

  if (graphHasCategoricalXAxis) {
    column_labels = column_labels.concat(graph.axis.x.categories);
    column_labels.push("units");
  }

  for (var i = 0; i < graph.data.columns.length; i++) {
    //each column contains either data or numerical x-axis values
    //The x-axis goes into column labels, data goes into rows.
    var column = graph.data.columns[i];
    if (column[0] === "x" && !graphHasCategoricalXAxis) {
      column_labels = column_labels.concat(column.slice(1, column.length));
      column_labels.push("units");
    } else {
      var seriesName = column[0];
      var row = [];
      row = row.concat(column);

      // Determine the appropriate decimal precision to display this data's values.
      // In order of specificity (and preference):
      //
      // 1. The decimal precision associated with a variable given in the
      // series name. If no individual word in the series name is a variable with
      // an assigned decimal precision, fall back to:
      //
      // 2. The decimal precision assigned to the variable associated with the entire
      // graph (ie, the primary variable). If no decimal precision is available for
      // this variable, fall back to:
      //
      // 3. the default util.PRECISION.

      var precision = _.reduce(
        seriesName.split(" "),
        function (prec, word) {
          return !_.isUndefined(prec)
            ? prec
            : getVariableOptions(word.toLowerCase(), "decimalPrecision");
        },
        undefined,
      );

      if (_.isUndefined(precision)) {
        precision = getVariableOptions(variable, "decimalPrecision");
      }

      if (_.isUndefined(precision)) {
        precision = PRECISION;
      }

      row = _.map(row, function (entry) {
        if (_.isNumber(entry)) {
          return entry.toFixed(precision);
        }
        return entry;
      });

      //get the corresponding units (or name of axis) - default to "y" if axis not listed
      var seriesAxis = graph.data.axes[seriesName]
        ? graph.data.axes[seriesName]
        : "y";
      row.push(graph.axis[seriesAxis].label.text);
      rows.push(row);
    }
  }
  rows.unshift(column_labels);
  return rows;
};

/*****************************************************************
 * 3. function that combines metadata and data (or any other two
 * sets of cells) into a single file.
 *****************************************************************/

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
      cell_ref = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex });
      ws[cell_ref] = { v: cellValue, t: "s" };
    });
  });

  // set combined worksheet range bounds
  var range = {
    s: { c: 0, r: 0 },
    e: {
      c: maxCols - 1,
      r: cells.length - 1,
    },
  };
  ws["!ref"] = XLSX.utils.encode_range(range);
  return ws;
};

export {
  exportDataToWorksheet,
  createWorksheetSummaryCells,
  generateDataCellsFromDataTable,
  assembleWorksheet,
  createTimeseriesWorksheetSummaryCells,
  generateDataCellsFromC3Graph,
};
