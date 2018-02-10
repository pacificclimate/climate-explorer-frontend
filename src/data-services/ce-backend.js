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

function getTimeseries({ variable_id, area, timeseriesDatasetId }) {
  return axios({
    baseURL: urljoin(CE_BACKEND_URL, 'timeseries'),
    params: {
      id_: timeseriesDatasetId || null,
      variable: variable_id,
      area: area || '',  // TODO: WKT
    },
  });
}

export { getTimeMetadata, getTimeseries };
