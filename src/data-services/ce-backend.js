import urljoin from "url-join";
import axios from "axios/index";
import flow from "lodash/fp/flow";
import fp from "lodash/fp";
import { timestampToYear } from "../core/util";
import pick from "lodash/fp/pick";
import flatten from "lodash/fp/flatten";

// TODO: Rename these to indicate purpose, not API endpoint

const transformMetadata = (metadata) =>
  flow(
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
          experiment: String(metadatum.experiment).replace(",r", ", r"),
          variable_id,
          variable_name,
          start_date: timestampToYear(metadatum.start_date),
          end_date: timestampToYear(metadatum.end_date),
          ...pick([
            "institution",
            "model_id",
            "model_name",
            "ensemble_member",
            "timescale",
            "multi_year_mean",
            "filepath",
            "climatological_statistic",
          ])(metadatum),
        };
      })(metadatum.variables);
    }),
    flatten,
  )(metadata);

export function getMetadata(ensemble_name) {
  // Get all the metadata for `ensemble_name` and transform it to CE form.
  return axios({
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, "multimeta"),
    params: {
      ensemble_name,
      extras: "filepath",
    },
  })
    .then((response) => response.data)
    .then(transformMetadata);
}

export function getPercentileMetadata(ensemble_name) {
  // Get all metadata for all percentile datasets in `ensemble_name`
  // and transform it to CE form.
  return axios({
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, "multimeta"),
    params: {
      ensemble_name,
      climatological_statistic: "percentile",
      extras: "filepath",
    },
  })
    .then((response) => response.data)
    .then(transformMetadata);
}

function getTimeMetadata(uniqueId) {
  return axios({
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, "metadata"),
    params: {
      // Note misleading naming: Param model_id is actually unique_id. FFS.
      model_id: uniqueId,
      extras: "filepath",
    },
  });
}

// TODO: Find a better name than "timeseries"?
function getTimeseries({ variable_id, unique_id }, area) {
  // Get the timeseries for the specified `variable_id`, `unique_id` and
  // `area`. (`variable_id` and `unique_id` are typically components of a
  // metadata object, hence their grouping like this.)
  return axios({
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, "timeseries"),
    params: {
      id_: unique_id || null,
      variable: variable_id,
      area: area || "", // TODO: WKT
    },
  });
}

// TODO: Find a better name than 'data', really!!
function getData({
  ensemble_name,
  model_id,
  variable_id,
  experiment,
  timescale,
  timeidx,
  area,
  climatological_statistic = null,
  percentile = null,
}) {
  // Get from 'data' API endpoint.
  // Description: Get data values from all files matching the following:
  //  ensemble_name,
  //  model (model_id)
  //  variable (variable_id),
  //  emission (experiment),
  //  timescale,
  //  time (timeidx)
  //  area
  //  climatological_statistic (optional)
  //  percentile (optional)
  // Those parameters are all props of components concerned, and so are
  // grouped as a single object for convenience.

  const queryExpString = guessExperimentFormatFromVariable(
    variable_id,
    experiment,
  );
  let query_params = {
    ensemble_name: ensemble_name,
    model: model_id,
    variable: variable_id,
    emission: queryExpString,
    timescale: timescale,
    time: timeidx,
    area: area || "",
  };

  // if the caller has passed optional parameters, add them to the call.
  if (climatological_statistic === "percentile" && percentile) {
    query_params["climatological_statistic"] = climatological_statistic;
    query_params["percentile"] = percentile;
  } else if (climatological_statistic) {
    query_params["climatological_statistic"] = climatological_statistic;
  }

  return axios({
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, "data"),
    params: query_params,
  });
}

// TODO: getTimeseries, getData and getStats are almost identical. Factor.
function getStats({
  ensemble_name,
  model_id,
  variable_id,
  experiment,
  timescale,
  timeidx,
  area,
}) {
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
    baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, "multistats"),
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

export function getWatershed({ ensemble_name, area }) {
  // Query the "watershed" API endpoint to get information on the
  // physical geology of the watershed.
  return axios({
    baseURL: urljoin(
      process.env.REACT_APP_CE_BACKEND_URL,
      "streamflow/watershed",
    ),
    params: {
      ensemble_name: getWatershedGeographyName(ensemble_name),
      station: area,
    },
  });
}

// Downscaled GCM data has experiment strings like 'historical,rcp26'
// while climdex data uses 'historical, rcp26'
// These are regularized by the app controllers, but the 'data'
// API backend requires the original format.
// TODO: remove this function when no longer needed.
function guessExperimentFormatFromVariable(variable, experiment) {
  return variable.search("ETCCDI") !== -1
    ? experiment
    : experiment.replace(" ", "");
}

// This is a temporary measure due to a quirk of the maps the backend uses.
// Long term, we would like to use a single map covers all watersheds,
// but this map has not yet been created. Currently we have multiple overlapping
// watershed maps, each in a different ensemble. This function helps the front end
// match up data ensembles with watershed geography ensembles.
function getWatershedGeographyName(ensemble) {
  return {
    bc_moti: "peace_watershed",
    upper_fraser: "upper_fraser_watershed",
    fraser: "fraser_watershed",
      frapce: "frapce_watershed",
      fraser_peace_columbia: "fraser_peace_columbia_watershed",
  }[ensemble];
}

export { getTimeMetadata, getTimeseries, getData, getStats };
