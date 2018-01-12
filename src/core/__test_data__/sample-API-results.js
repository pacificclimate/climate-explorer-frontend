/*********************************************************************
 * sample-API-results.js - sample data for testing.
 * 
 * A collection of objects representing sample results from the 
 * climate explorer backend API, used to test data validation, graph 
 * and table generation, and data export.
 * 
 * Includes sample valid results from "multimeta," "multistats," "data," 
 * and "timeseries" API calls, as yielded by the API as of 8/3/2017, and 
 * should be updated if the API changes.
 * 
 * Also includes modified versions of member functions used by Data 
 * Controller components to transform data before passing it to parsers:
 * 
 *  - metadataToArray() transforms the results of the multimeta call from an
 * object keyed by unique_id to an array that contains all the results.
 * 
 *  - addRunToStats() copies the "run" attribute to stats data objects
 *  from the associated metadata.
 *********************************************************************/

/**************************************************************
 * Sample results from the timeseries API call.
 **************************************************************/ 

//A set of monthly, seasonal, and annual to test time resolutions:

var monthlyTasmaxTimeseries = {
    "data": {
      "1977-01-15T00:00:00Z": -20.599000150601793,
      "1977-02-15T00:00:00Z": -18.805330621105593,
      "1977-03-15T00:00:00Z": -13.699929389799847,
      "1977-04-15T00:00:00Z": -5.049101554957231,
      "1977-05-15T00:00:00Z": 4.416844369980984,
      "1977-06-15T00:00:00Z": 11.841563876512202,
      "1977-07-15T00:00:00Z": 15.835593959678455,
      "1977-08-15T00:00:00Z": 13.96384427223645,
      "1977-09-15T00:00:00Z": 7.324053575459457,
      "1977-10-15T00:00:00Z": -0.9633257236057498,
      "1977-11-15T00:00:00Z": -10.452775900045767,
      "1977-12-15T00:00:00Z": -16.96361296358877
    },
    "id": "tasmax_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada",
    "units": "degC"
  };
  
var seasonalTasmaxTimeseries = {
    "data": {
      "1977-01-16T00:00:00Z": -18.78877913696885,
      "1977-04-16T00:00:00Z": -4.774442646969235,
      "1977-07-16T00:00:00Z": 13.902496218134482,
      "1977-10-16T00:00:00Z": -1.3596123480139706
    },
    "id": "tasmax_sClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada",
    "units": "degC"
  };

var annualTasmaxTimeseries = {
    "data": {
      "1977-07-02T00:00:00Z": -2.671051067797724
    },
    "id": "tasmax_aClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada",
    "units": "degC"
  };

//timeseries for other variables to test variable comparison operations:

var monthlyTasminTimeseries = {
    "data": {
      "1977-01-15T00:00:00Z": -29.349525294996894,
      "1977-02-15T00:00:00Z": -28.22889203091248,
      "1977-03-15T00:00:00Z": -23.832514978182587,
      "1977-04-15T00:00:00Z": -14.969080144025098,
      "1977-05-15T00:00:00Z": -5.030717704888873,
      "1977-06-15T00:00:00Z": 2.68702425095454,
      "1977-07-15T00:00:00Z": 6.344790167480121,
      "1977-08-15T00:00:00Z": 5.23263986108495,
      "1977-09-15T00:00:00Z": -0.11578116468862609,
      "1977-10-15T00:00:00Z": -8.006546467609342,
      "1977-11-15T00:00:00Z": -17.829788351577378,
      "1977-12-15T00:00:00Z": -25.101709291817045
    },
    "id": "tasmin_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada",
    "units": "degC"
  };

var monthlyPrTimeseries = {
    "data": {
      "1977-01-15T00:00:00Z": 0.9872395791792838,
      "1977-02-15T00:00:00Z": 0.8930409973169107,
      "1977-03-15T00:00:00Z": 0.8367793517716902,
      "1977-04-15T00:00:00Z": 0.7965349522694691,
      "1977-05-15T00:00:00Z": 1.0415729847555244,
      "1977-06-15T00:00:00Z": 1.3852941793561468,
      "1977-07-15T00:00:00Z": 1.7647179206314954,
      "1977-08-15T00:00:00Z": 1.7471618596613594,
      "1977-09-15T00:00:00Z": 1.689143839323418,
      "1977-10-15T00:00:00Z": 1.3200195766313088,
      "1977-11-15T00:00:00Z": 1.2184817064178701,
      "1977-12-15T00:00:00Z": 1.0792959674338725
    },
    "id": "pr_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada",
    "units": "kg m-2 d-1"
  };


/**************************************************************
 * Sample result from the multistats API call.
 **************************************************************/

var tasmaxStats = {
    "tasmax_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada": {
      "min": -37.532611494,
      "units": "degC",
      "mean": -20.599000150601793,
      "max": 7.411306014,
      "time": "1977-06-30T12:00:00Z",
      "median": -21.791406461999998,
      "ncells": 257263,
      "stdev": 8.590155266300552
      },
    "tasmax_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19810101-20101231_Canada": {
      "min": -36.134885262000005,
      "units": "degC",
      "mean": -19.534196834187902,
      "max": 7.905698262,
      "time": "1997-06-30T12:00:00Z",
      "median": -20.56152945,
      "ncells": 257263,
      "stdev": 8.251508435489493
      }
  };


/******************************************************************
 * Sample results from the data API call.
 ******************************************************************/

var tasmaxData = {
    "r1i1p1": {
      "data": {
        "1997-01-15T00:00:00Z": -19.534196834187902,
        "2055-01-15T00:00:00Z": -17.825752320828578,
        "1977-01-15T00:00:00Z": -20.599000150601793,
        "2085-01-15T00:00:00Z": -17.498223073165622,
        "2025-01-15T00:00:00Z": -18.02569051912951,
        "1986-01-15T00:00:00Z": -19.950983475060585
      },
      "units": "degC"
    }
  };

var tasminData = {
    "r1i1p1": {
      "data": {
        "1997-01-15T00:00:00Z": -28.265036079409857,
        "2055-01-15T00:00:00Z": -24.776227407561837,
        "1977-01-15T00:00:00Z": -29.349525294996894,
        "2085-01-15T00:00:00Z": -23.266258103718755,
        "2025-01-15T00:00:00Z": -26.74515418667965,
        "1986-01-15T00:00:00Z": -28.53984884511497
      },
      "units": "degC"
    }
  };

var prData = {
    "r1i1p1": {
      "data": {
        "1997-01-15T00:00:00Z": 1.0079478619576079,
        "2055-01-15T00:00:00Z": 1.0784823362419018,
        "1977-01-15T00:00:00Z": 0.9872395791792838,
        "2085-01-15T00:00:00Z": 1.042760714525526,
        "2025-01-15T00:00:00Z": 1.0949318075445762,
        "1986-01-15T00:00:00Z": 0.9809310073822513
      },
      "units": "kg m-2 d-1"
    }
  };

/****************************************************************
 * Sample result from the multimeta API call. Contains metadata
 * for the five datasets in the "timeseries" sample data, plus
 * the additional dataset in the "multistats" sample data.
 ****************************************************************/

var metadata = {
    "tasmax_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada": {
      "institution": "PCIC",
      "ensemble_member": "r1i1p1",
      "variables": {
        "tasmax": "Daily Maximum Near-Surface Air Temperature"
      },
      "timescale": "monthly",
      "model_name": null,
      "model_id": "bcc-csm1-1-m",
      "experiment": "historical, rcp45",
      "start_date": "1961",
      "end_date": "1990" 
    },

    "tasmax_sClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada": {
      "institution": "PCIC",
      "ensemble_member": "r1i1p1",
      "variables": {
        "tasmax": "Daily Maximum Near-Surface Air Temperature"
      },
      "timescale": "seasonal",
      "model_name": null,
      "model_id": "bcc-csm1-1-m",
      "experiment": "historical, rcp45",
      "start_date": "1961",
      "end_date": "1990"
    },
    
    "tasmax_aClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada": {
      "institution": "PCIC",
      "ensemble_member": "r1i1p1",
      "variables": {
        "tasmax": "Daily Maximum Near-Surface Air Temperature"
      },
      "timescale": "yearly",
      "model_name": null,
      "model_id": "bcc-csm1-1-m",
      "experiment": "historical, rcp45",
      "start_date": "1961",
      "end_date": "1990"
    },
    
    "tasmin_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada": {
      "institution": "PCIC",
      "ensemble_member": "r1i1p1",
      "variables": {
        "tasmin": "Daily Minimum Near-Surface Air Temperature"
      },
      "timescale": "monthly",
      "model_name": null,
      "model_id": "bcc-csm1-1-m",
      "experiment": "historical, rcp45",
      "start_date": "1961",
      "end_date": "1990"
    },
    
    "pr_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19610101-19901231_Canada": {
      "institution": "PCIC",
      "ensemble_member": "r1i1p1",
      "variables": {
        "pr": "Precipitation"
      },
      "timescale": "monthly",
      "model_name": null,
      "model_id": "bcc-csm1-1-m",
      "experiment": "historical, rcp45",
      "start_date": "1961",
      "end_date": "1990"
    },
    
    "tasmax_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_19810101-20101231_Canada": {
      "institution": "PCIC",
      "ensemble_member": "r1i1p1",
      "variables": {
        "tasmax": "Daily Maximum Near-Surface Air Temperature"
      },
      "timescale": "monthly",
      "model_name": null,
      "model_id": "bcc-csm1-1-m",
      "experiment": "historical, rcp45",
      "start_date": "1981",
      "end_date": "2010"
    }
  };

/****************************************************************
 * Data-transforming functions that match transformations done
 * by DataControllers.
 ****************************************************************/

/*
 * this functon reproduces the process used in AppMixin.js to create
 * an array of flat metadata from the attributed-formatted results of 
 * the multimeta API call; it converts the raw API results into the 
 * array format used internally by the climate explorer frontend. 
 * Mimics part of AppMixin.componentDidLoad()
 */
var metadataToArray = function () {
  var models = [];
  var vars;
  var _ = require('underscore');
  
  for (var key in metadata) {
    vars = Object.keys(metadata[key].variables);

    for (var v in vars) {
      models.push(_.extend({
        unique_id: key,
        variable_id: vars[v],
        variable_name: metadata[key].variables[vars[v]],
        }, _.omit(metadata[key], 'variables')));
      }
    }
  return models;
};

/*
 * this function reproduces the process used in DataControllerMixin.js 
 * to add the "run" value to the object returned by the stats API. Run 
 * is derived from metadata, ultimately the multimeta API.
 * Mimics DataMixin.injectRunIntoStats() 
 */
var addRunToStats = function () {
  var withRun = JSON.parse(JSON.stringify(tasmaxStats));
  for(let entry in withRun) {
    withRun[entry].run = metadata[entry].ensemble_member;
  }
  return withRun;
};


module.exports = {monthlyTasmaxTimeseries, seasonalTasmaxTimeseries, annualTasmaxTimeseries,
    monthlyTasminTimeseries, monthlyPrTimeseries,
    tasmaxStats, addRunToStats,
    tasmaxData, tasminData, prData,
    metadata, metadataToArray};