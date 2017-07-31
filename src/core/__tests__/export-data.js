var sampleMetadata = {
    "model_id": "CSIRO-Mk3-6-0",
    "variable_id": "txxETCCDI",
    "experiment": "historical",
    "meta": [
      {
        "unique_id": "txxETCCDI_aMon_CSIRO-Mk3-6-0_historical_r1i1p1_19610101-19901231",
        "variable_id": "txxETCCDI",
        "variable_name": "Monthly Maximum of Daily Maximum Temperature",
        "model_id": "CSIRO-Mk3-6-0",
        "experiment": "historical",
        "model_name": null,
        "institution": "Australian",
        "timescale": "other",
        "ensemble_member": "r1i1p1",
        "start_date": "1961",
        "end_date": "1990"
      },
      {
        "unique_id": "txxETCCDI_aMon_CSIRO-Mk3-6-0_historical_r1i1p1_19710101-20001231",
        "variable_id": "txxETCCDI",
        "variable_name": "Monthly Maximum of Daily Maximum Temperature",
        "model_id": "CSIRO-Mk3-6-0",
        "experiment": "historical",
        "model_name": null,
        "institution": "Australian",
        "timescale": "other",
        "ensemble_member": "r1i1p1",
        "start_date": "1961",
        "end_date": "1990",
      }
    ]
  };

var sampleRun = "txxETCCDI_aMon_CSIRO-Mk3-6-0_historical_r1i1p1_19610101-19901231";

var sampleProjectedChangeGraph = {
    "data": {
      "x": "x",
      "columns": [
        [ "r1i1p1", 17.49576144748264, 17.44171651204427 ],
        [ "r2i1p1", 8.66965823703342, 8.568426344129774 ],
        [ "r3i1p1", 8.702445136176216, 8.532513088650173 ],
        [ "r4i1p1", 8.520773993598091, 8.477428860134548 ],
        [ "r5i1p1", 8.606376647949219, 8.523169623480904 ],
        [ "x", "1986-01-16", "1977-01-16"]
      ],
      "axes": {
        "r2i1p1": "y",
        "r5i1p1": "y",
        "r1i1p1": "y",
        "r3i1p1": "y",
        "r4i1p1": "y"
      }
    },
    "axis": {
      "x": {
        "type": "timeseries",
        "tick": {
          "format": "%Y-%m-%d"
        }
      },
      "y": {
        "label": {
          "position": "outer-middle",
          "text": "degrees_C"
        },
        "tick": {}
      }
    },
    "tooltip": {
      "grouped": true,
      "format": {}
    }
  };

var sampleAnnualCycleGraph = {
    "data": {
      "columns": [
        [ "Monthly Mean", 8.561006334092882, 8.309687296549479, 8.734339396158854,
          10.019952562120226, 11.641334533691406, 12.131902058919271, 12.373301188151041,
          12.167421129014757, 11.323324415418837, 10.279920789930555, 9.329340616861979,
          8.81106228298611 ],
        [ "Seasonal Average", 8.560585021972656, 8.560585021972656, 10.131876627604166,
          10.131876627604166, 10.131876627604166, 12.224208407931858, 12.224208407931858,
          12.224208407931858, 10.310862223307291, 10.310862223307291, 10.310862223307291,
          8.560585021972656 ],
        [ "Annual Average", 10.30688222249349, 10.30688222249349, 10.30688222249349,
          10.30688222249349, 10.30688222249349, 10.30688222249349, 10.30688222249349,
          10.30688222249349, 10.30688222249349, 10.30688222249349, 10.30688222249349,
          10.30688222249349 ]
      ],
      "types": {
        "Annual Average": "step",
        "Seasonal Average": "step",
        "Monthly Mean": "line"
      },
      "labels": {
        "format": {}
      },
      "axes": {
        "Monthly Mean": "y"
      }
    },
    "axis": {
      "x": {
        "type": "category",
        "categories":
          [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"]
      },
      "y": {
        "label": {
          "text": "degrees_C",
          "position": "outer-middle"
        },
        "tick": {}
      }
    },
    "tooltip": {
      "grouped": true,
      "format": {}
    }
  };

var expectedTimeSeriesHeaders = [
  [ "Model", "Emissions Scenario", "Variable ID", "Variable Name", "Period", "Run"],
  [ "CSIRO-Mk3-6-0", "historical", "txxETCCDI", "Monthly Maximum of Daily Maximum Temperature", "1961-1990", "r1i1p1"]
];

var expectedAnnualGraphData = [
  [ "Time Series", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December", "units"],
  [ "Monthly Mean", 8.561006334092882, 8.309687296549479, 8.734339396158854, 10.019952562120226,
    11.641334533691406, 12.131902058919271, 12.373301188151041, 12.167421129014757,
    11.323324415418837, 10.279920789930555, 9.329340616861979, 8.81106228298611, "degrees_C" ],
  [ "Seasonal Average", 8.560585021972656, 8.560585021972656, 10.131876627604166, 10.131876627604166,
    10.131876627604166, 12.224208407931858, 12.224208407931858, 12.224208407931858,
    10.310862223307291, 10.310862223307291, 10.310862223307291, 8.560585021972656, "degrees_C" ],
  [ "Annual Average", 10.30688222249349, 10.30688222249349, 10.30688222249349, 10.30688222249349,
    10.30688222249349, 10.30688222249349, 10.30688222249349, 10.30688222249349,
    10.30688222249349, 10.30688222249349, 10.30688222249349, 10.30688222249349, "degrees_C" ]
];

var expectedProjectedChangeGraphData = [
  [ "Run", "1986-01-16", "1977-01-16", "units"],
  [ "r1i1p1", 17.49576144748264, 17.44171651204427, "degrees_C"],
  [ "r2i1p1", 8.66965823703342, 8.568426344129774, "degrees_C"],
  [ "r3i1p1", 8.702445136176216, 8.532513088650173, "degrees_C"],
  [ "r4i1p1", 8.520773993598091, 8.477428860134548, "degrees_C"],
  [ "r5i1p1", 8.606376647949219, 8.523169623480904, "degrees_C"]
];




module.exports = {sampleMetadata, sampleRun, expectedTimeSeriesHeaders, sampleAnnualCycleGraph,
    expectedAnnualGraphData, sampleProjectedChangeGraph, expectedProjectedChangeGraphData };
