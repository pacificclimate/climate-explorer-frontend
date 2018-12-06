import urljoin from 'url-join';
import axios from 'axios/index';

// TODO: Rename these to indicate purpose, not API endpoint


function getTimeMetadata(uniqueId) {
  return axios({
    baseURL: urljoin(CE_BACKEND_URL, 'metadata'),
    params: {
      model_id: uniqueId,
    },
  });
}

// TODO: Find a better name than "timeseries"?
function getTimeseries({ variable_id, unique_id }, area) {
  // Get the timeseries for the specified `variable_id`, `unique_id` and
  // `area`. (`variable_id` and `unique_id` are typically components of a
  // metadata object, hence their grouping like this.)
  return axios({
    baseURL: urljoin(CE_BACKEND_URL, 'timeseries'),
    params: {
      id_: unique_id || null,
      variable: variable_id,
      area: area || '',  // TODO: WKT
    },
  });
}

// TODO: Find a better name than 'data', really!!
function getData(
  { ensemble_name, model_id, variable_id, experiment, timescale, timeidx, area },
) {
  // Get from 'data' API endpoint.
  // Description: Get data values from all files matching the following:
  //  ensemble_name,
  //  model (model_id)
  //  variable (variable_id),
  //  emission (experiment),
  //  timescale,
  //  time (timeidx)
  //  area
  // Those parameters are all props of components concerned, and so are
  // grouped as a single object for convenience.

  let queryExpString = guessExperimentFormatFromVariable(variable_id, experiment);
  return axios({
    baseURL: urljoin(CE_BACKEND_URL, 'data'),
    params: {
      ensemble_name: ensemble_name,
      model: model_id,
      variable: variable_id,
      emission: queryExpString,
      timescale: timescale,
      time: timeidx,
      area: area || '',
    },
  });
}

// TODO: getTimeseries, getData and getStats are almost identical. Factor.
function getStats (
    { ensemble_name, model_id, variable_id, experiment, timescale, timeidx, area }
) {
  // Query the "multistats" API endpoint.
  // Gets an object from each qualifying dataset file with the following
  // information:
  //  {
  //   unique_ID: {
  //      min
  //      max
  //      mean
  //      median
  //      stdev
  //      ncells
  //      units
  //      time (median time represented by the dataset)
  //      modtime (last time dataset was modified)
  //    }
  //  }
  const emission = guessExperimentFormatFromVariable(variable_id, experiment);
  return axios({
    baseURL: urljoin(CE_BACKEND_URL, 'multistats'),
    params: {
      ensemble_name: ensemble_name,
      model: model_id,
      variable: variable_id,
      emission,
      time: timeidx,
      timescale,
      area: area || null,
    },
  });
}



// Downscaled GCM data has experiment strings like 'historical,rcp26'
// while climdex data uses 'historical, rcp26'
// These are regularized by AppMixin.updateMetadata(), but the 'data'
// API backend requires the original format.
// TODO: remove this function when no longer needed.
function guessExperimentFormatFromVariable(variable, experiment) {
  return variable.search("ETCCDI") != -1 ? experiment : experiment.replace(' ', '');
}


export { getTimeMetadata, getTimeseries, getData, getStats };
