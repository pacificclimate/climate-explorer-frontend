// Data service for ncWMS HTTP API requests.
// Includes both HTTP request functions and supporting functions.

import axios from 'axios/index';
import _ from 'underscore';


function getBaseWMSParams({ dataset, variableId, wmsTime, logscale, range }) {
  const fixedParams = {
    layers: `${dataset}/${variableId}`,
    time: wmsTime,
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


function getRasterWMSParams({ dataset, variableId, wmsTime, palette, logscale, range }) {
  return Object.assign(
    getBaseWMSParams({ dataset, variableId, wmsTime, logscale, range }),
    {
      styles: `default-scalar/${palette}`,
      opacity: 0.7,
    }
  );
}


function getIsolineWMSParams({ dataset, variableId, wmsTime, palette, logscale, range }) {
  return Object.assign(
    getBaseWMSParams({ dataset, variableId, wmsTime, logscale, range }),
    {
      styles: `colored_contours/${palette}`,
      opacity: 1.0,
    }
  );
}

function getWMSParams(layerType, props) {
  // Return parameters required for a call to the ncWMS tile layer API.
  console.log('getWMSParams', layerType, props);
  // TODO: simplify
  if (layerType === 'raster') {
    return getRasterWMSParams(props);
  } else if (layerType === 'isoline') {
    return getIsolineWMSParams(props);
  }
}


function getLayerMinMax(layer, props, bounds) {
  // Request min and max values from ncWMS layer.
  // Returns a promise for the request response.

  const { layers, version, srs, time } = getWMSParams(layer, props[layer]);

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
