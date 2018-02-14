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

export { getTimeMetadata, getTimeseries };
