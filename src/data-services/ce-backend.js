import urljoin from 'url-join';
import axios from 'axios/index';
import flow from 'lodash/fp/flow';
import fp from 'lodash/fp';
import { timestampToYear } from '../core/util';
import pick from 'lodash/fp/pick';
import flatten from 'lodash/fp/flatten';

// TODO: Rename these to indicate purpose, not API endpoint


const transformMetadata = metadata => flow(
  // Transform the metadata received from the backend to the metadata
  // we like to process in CE. This mainly means unrolling a couple
  // of nested hashes (namely, the metadata object iteself, and each
  // `variables` prop within each element of it) into an array with explicit
  // props for the hash keys.
  // Note: The function wrapper `metadata => (...)(metadata)` should ideally
  // be omitted, but the importation step that triggers the addition of
  // `mapWithKey` to `fp` doesn't happen early enough to prevent compilation
  // errors. It *is* available at the time this function is invoked. Alas.
  fp.mapWithKey((metadatum, unique_id) => {
    return fp.mapWithKey((variable_name, variable_id) => {
      return {
        unique_id,
        experiment: String(metadatum.experiment).replace(',r', ', r'),
        variable_id,
        variable_name,
        start_date: timestampToYear(metadatum.start_date),
        end_date: timestampToYear(metadatum.end_date),
        ...pick([
          'institution', 'model_id', 'model_name', 'ensemble_member',
          'timescale', 'multi_year_mean'
        ])(metadatum)
      };
    })(metadatum.variables)
  }),
  flatten,
)(metadata);

export function getMetadata(ensemble_name) {
  // Get all the metadata for `ensemble_name` and transform it to CE form.
  return axios({
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'multimeta'),
    params: { ensemble_name },
  })
    .then(response => response.data)
    .then(transformMetadata)
}


function getTimeMetadata(uniqueId) {
  return axios({
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'metadata'),
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
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'timeseries'),
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
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'data'),
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
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'multistats'),
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
// These are regularized by the app controllers, but the 'data'
// API backend requires the original format.
// TODO: remove this function when no longer needed.
function guessExperimentFormatFromVariable(variable, experiment) {
  return variable.search("ETCCDI") != -1 ? experiment : experiment.replace(' ', '');
}


export { getTimeMetadata, getTimeseries, getData, getStats };
