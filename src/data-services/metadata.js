import urljoin from 'url-join';
import axios from 'axios/index';

function getTimeMetadata(uniqueId) {
  return axios({
    baseURL: urljoin(CE_BACKEND_URL, 'metadata'),
    params: {
      model_id: uniqueId,
    },
  });
}

export { getTimeMetadata }