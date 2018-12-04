// Data service for ncWMS HTTP API requests.
// Includes both HTTP request functions and supporting functions.

import axios from 'axios/index';
import _ from 'underscore';


export function getBaseWMSParams(
  { dataset, variableId, wmsTime, opacity, logscale, range }
) {
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
    opacity,
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


export function getRasterWMSParams({ palette, ...rest }) {
  return Object.assign(
    getBaseWMSParams(rest),
    {
      styles: `default-scalar/${palette}`,
    }
  );
}


export function getIsolineWMSParams({ palette, ...rest }) {
  return Object.assign(
    getBaseWMSParams(rest),
    {
      styles: `colored_contours/${palette}`,
    }
  );
}

export function getAnnotatedWMSParams(props) {
  return Object.assign(
    getBaseWMSParams(props),
    {
      styles: `contours`,
    }
  );
}

export function getWMSParams(layerType, props) {
  // Return parameters required for a call to the ncWMS tile layer API.
  // TODO: simplify
  if (layerType === 'raster') {
    return getRasterWMSParams(props);
  } else if (layerType === 'isoline') {
    return getIsolineWMSParams(props);
  } else if (layerType === 'annotated') {
    return getAnnotatedWMSParams(props);
  }
}


export function getLayerMinMax(layer, props, bounds) {
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
