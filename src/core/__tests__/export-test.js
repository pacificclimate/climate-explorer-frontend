/******************************************************************
 * export-test.js - tests for functions that export data to CSV
 *
 * There is one test (sometimes with multiple parts) for each
 * functon in ../export.js. The tests are in the same order as
 * the functions they test.
 *
 * test data from ./sample-API-results.js
 * validation functions from ./test-validators.js
 ******************************************************************/

import _ from "lodash";
import xlsx from "xlsx";
import * as exportdata from "../export";
import * as validate from "../__test_data__/test-validators";
import * as mockAPI from "../__test_data__/sample-API-results";
import * as util from "../util";
import * as chart from "../chart-generators";

jest.dontMock("../util");
jest.dontMock("../chart-generators");
jest.dontMock("../export");
jest.dontMock("lodash");
jest.dontMock("xlsx");

/*
 * It's not clear how to test exportDataToWorksheet, which would require
 * capturing and testing a file saved to the user. However, most of the
 * work of creating the files is done by helper functions that can be
 * tested seperately, so overall there's reasonable test coverage of
 * export functionality.
 */
describe("exportDataToWorksheet", function () {
  xit("exports an annual cycle graph to file", function () {});
  xit("exports a stats table to file", function () {});
  xit("exports a long term average graph to file", function () {});
});

describe("createWorksheetSummaryCells", function () {
  it("generates summary cells for an exported data table", function () {
    var id = mockAPI.monthlyTasmaxTimeseries.id;
    var metadata = _.find(mockAPI.metadataToArray(), function (m) {
      return m.unique_id == id;
    });
    var options = _.pick(metadata, "model_id", "variable_id", "experiment");
    options.meta = mockAPI.metadataToArray();
    var summary = exportdata.createWorksheetSummaryCells(options, "January");
    expect(validate.isRectangularArray(summary, 2, 5)).toBe(true);
    expect(validate.allDefinedArray(summary)).toBe(true);
    expect(summary[1][2]).toBe("January");
    expect(summary[1][4]).toBe("Daily Maximum Near-Surface Air Temperature");
    expect(summary[1][0]).toBe("bcc-csm1-1-m");
  });
});

describe("createTimeseriesWorksheetSummaryCells", function () {
  it("generates summary cells for an exported annual cycle graph", function () {
    var id = mockAPI.monthlyTasmaxTimeseries.id;
    var metadata = _.find(mockAPI.metadataToArray(), function (m) {
      return m.unique_id == id;
    });
    var run = _.pick(metadata, "start_date", "end_date", "ensemble_member");
    var dataOptions = _.pick(
      metadata,
      "model_id",
      "variable_id",
      "experiment",
      "variable_id",
    );
    dataOptions.meta = mockAPI.metadataToArray();
    var headers = exportdata.createTimeseriesWorksheetSummaryCells(
      dataOptions,
      run,
    );
    expect(validate.isRectangularArray(headers, 2, 6)).toBe(true);
    expect(validate.allDefinedArray(headers)).toBe(true);
    expect(headers[1][2]).toBe("1961-1990");
    expect(headers[1][0]).toBe("bcc-csm1-1-m");
  });
});

describe("generateDataCellsFromDataTable", function () {
  it("generates data cells from a data table", function () {
    var toExport = util.parseBootstrapTableData(
      mockAPI.addRunToStats(),
      mockAPI.metadataToArray(),
    );
    var cells = exportdata.generateDataCellsFromDataTable(toExport);
    //make sure each series is present
    expect(validate.isRectangularArray(cells, 3, 8)).toBe(true);
    expect(cells[1][0]).toBe("1961 - 1990");
    expect(cells[2][0]).toBe("1981 - 2010");
    //spot check a couple expected values
    expect(cells[1][3]).toBe(7.41);
    expect(cells[2][5]).toBe(-20.56);
    //make sure nothing is undefined
    expect(validate.allDefinedArray(cells)).toBe(true);
  });
});

describe("generateDataCellsFromC3Graph", function () {
  var metadata = mockAPI.metadataToArray();
  it("generates data for export from a single-line annual cycle graph", function () {
    var toExport = chart.timeseriesToAnnualCycleGraph(
      metadata,
      mockAPI.monthlyTasmaxTimeseries,
    );
    var cells = exportdata.generateDataCellsFromC3Graph(
      toExport,
      "Time Series",
    );
    //make sure all data series are present
    expect(validate.isRectangularArray(cells, 2, 14)).toBe(true);
    expect(cells[1][0]).toBe("Monthly Mean");
    //spot check representative values
    expect(cells[1][13]).toBe("tasmax degC");
    expect(cells[1][1]).toBe("-20.60");
    expect(cells[1][12]).toBe("-16.96");
    //make sure nothing is undefined
    expect(validate.allDefinedArray(cells)).toBe(true);
  });
  it("generates data for export from a multi-line annual cycle graph", function () {
    var toExport = chart.timeseriesToAnnualCycleGraph(
      metadata,
      mockAPI.monthlyTasmaxTimeseries,
      mockAPI.seasonalTasmaxTimeseries,
      mockAPI.annualTasmaxTimeseries,
    );
    var cells = exportdata.generateDataCellsFromC3Graph(
      toExport,
      "Time Series",
    );
    //make sure all expected data is present
    expect(validate.isRectangularArray(cells, 4, 14)).toBe(true);
    expect(cells[1][0]).toBe("Monthly Mean");
    expect(cells[2][0]).toBe("Seasonal Mean");
    expect(cells[3][0]).toBe("Annual Mean");
    //spot check a couple representative values
    expect(cells[3][6]).toBe("-2.67");
    expect(cells[2][10]).toBe("-1.36");
    expect(cells[1][3]).toBe("-13.70");
    //make sure nothing is undefined
    expect(validate.allDefinedArray(cells)).toBe(true);
  });
  it("generates data for export from a long term average graph", function () {
    var toExport = chart.dataToLongTermAverageGraph([mockAPI.tasmaxData]);
    var cells = exportdata.generateDataCellsFromC3Graph(toExport, "Run");
    expect(validate.isRectangularArray(cells, 2, 8)).toBe(true);
    expect(cells[1][2]).toBe("-17.83");
    expect(cells[1][7]).toBe("degC");
    expect(validate.allDefinedArray(cells)).toBe(true);
  });
});

describe("assembleWorksheet", function () {
  it("assembles an exportable worksheet from summary and data cells", function () {
    var id = mockAPI.monthlyTasmaxTimeseries.id;
    //build header cells
    var metadata = _.find(mockAPI.metadataToArray(), function (m) {
      return m.unique_id == id;
    });
    var headerOptions = _.pick(
      metadata,
      "model_id",
      "variable_id",
      "experiment",
    );
    headerOptions.meta = mockAPI.metadataToArray();
    var headers = exportdata.createWorksheetSummaryCells(
      headerOptions,
      "January",
    );
    //build data cells
    var dataTable = util.parseBootstrapTableData(
      mockAPI.addRunToStats(),
      mockAPI.metadataToArray(),
    );
    var data = exportdata.generateDataCellsFromDataTable(dataTable);
    //test assembly
    var ws = exportdata.assembleWorksheet(headers.concat([[]], data));
    expect(ws["!ref"]).toBe("A1:H6");
  });
});
