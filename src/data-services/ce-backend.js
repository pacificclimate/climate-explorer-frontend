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
  return axios({
    baseURL: urljoin(CE_BACKEND_URL, 'data'),
    params: {
      ensemble_name: ensemble_name,
      model: model_id,
      variable: variable_id,
      emission: experiment,
      timescale: timescale,
      time: timeidx,
      area: area || '',
    },
  });
}


export { getTimeMetadata, getTimeseries, getData };
