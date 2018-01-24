// Data service for ncWMS HTTP API requests.
// Includes both HTTP request functions and supporting functions.

import axios from 'axios/index';
import _ from 'underscore';


function getBaseWMSParams({ dataset, variable, time, logscale, range }) {
  const fixedParams = {
    layers: `${dataset}/${variable}`,
    time,
    noWrap: true,
    format: 'image/png',
    transparent: true,
    numcolorbands: 249,
    version: '1.1.1',
    srs: 'EPSG:4326',
    logscale,
  };

  if (logscale !== 'true' || _.isUndefined(range)) {
    return fixedParams;
  }

  const min = Math.max(range.min, Number.EPSILON);
  const max = Math.max(range.max, Number.EPSILON * 2);
  return Object.assign(
    fixedParams,
    {
      colorscalerange: `${min},${max}`,
      abovemaxcolor: 'transparent',
      belowmincolor: 'transparent',
    }
  );
}


function getRasterWMSParams({ dataset, variable, time, palette, logscale, range }) {
  return Object.assign(
    getBaseWMSParams({ dataset, variable, time, logscale, range }),
    {
      styles: `default-scalar/${palette}`,
      opacity: 0.7,
    }
  );
}


function getIsolineWMSParams({ dataset, variable, time, palette, logscale, range }) {
  return Object.assign(
    getBaseWMSParams({ dataset, variable, time, logscale, range }),
    {
      styles: `colored_contours/${palette}`,
      opacity: 1.0,
    }
  );
}

function getWMSParams(layerType, props) {
  // Return parameters required for a call to the ncWMS tile layer API.
  console.log('getWMSParams', layerType, props);

  if (layerType === 'raster') {
    return getRasterWMSParams({
      dataset: props.rasterDataset,
      variable: props.rasterVariable,
      time: props.rasterTime,
      palette: props.rasterPalette,
      logscale: props.rasterLogscale,
      range: props.rasterRange,
    });
  } else if (layerType === 'isoline') {
    return getIsolineWMSParams({
      dataset: props.isolineDataset,
      variable: props.isolineVariable,
      time: props.isolineTime,
      palette: props.isolinePalette,
      logscale: props.isolineLogscale,
      range: props.isolineRange,
    });
  }
}


function getLayerMinMax(layer, props, bounds) {
  // Request min and max values from ncWMS layer.
  // Returns a promise for the request response.

  const { layers, version, srs, time } = getWMSParams(layer, props);

  return axios(
    NCWMS_URL,
    {
      params: {
        styles: 'default-scalar',
        request: 'GetMetadata',
        item: 'minmax',
        crs: props.srs,  // TODO: ?? wrong (undefined) but it works anyway; incorrect in original code
        elevation: 0,
        width: 100,
        height: 100,
        bbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
        layers,
        version,
        srs,
        time,
      },
    }
  );
}


export {
  getRasterWMSParams, getIsolineWMSParams, getWMSParams,
  getLayerMinMax
};
