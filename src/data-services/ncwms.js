// Data service for ncWMS HTTP API requests.
// Includes both request functions and supporting functions.

import axios from 'axios/index';
import _ from 'underscore';


function getWMSParams(layer, props) {
  // Return parameters required for a call to the ncWMS tile layer API.
  // TODO: Refactor into separate raster and isoline functions
  // TODO: `props` param is sloppy; instead break out into explicitly named
  // params (use destructuring param syntax).
  console.log('getWMSParams', layer, props);

  const layerName = props[`${layer}Dataset`] + '/' + props[`${layer}Variable`];

  let params = {
    layers: layerName,
    noWrap: true,
    format: 'image/png',
    transparent: true,
    time: props[`${layer}Time`],
    numcolorbands: 249,
    version: '1.1.1',
    srs: 'EPSG:4326',
    logscale: 'false',
  };

  if (layer == 'raster') {
    params.styles = `default-scalar/${props.rasterPalette}`;
    params.opacity = 0.7;
    if (props.rasterLogscale=='true' && !_.isUndefined(props.rasterRange)) {
      console.log('getWMSParams', 'RASTER LOGSCALE')
      // clip the dataset to > 0, values of 0 or less do not have a
      // non-complex logarithm
      params.logscale = props.rasterLogscale;
      const min = Math.max(props.rasterRange.min, Number.EPSILON);
      const max = Math.max(props.rasterRange.max, Number.EPSILON * 2);
      params.colorscalerange = `${min},${max}`;
      params.abovemaxcolor = 'transparent';
      params.belowmincolor = 'transparent';
    }
  } else if (layer == 'isoline') {
    params.styles = `colored_contours/${props.isolinePalette}`;
    params.numContours = props.numberOfContours;
    params.opacity = 1;
    if (props.isolineLogscale=='true' && !_.isUndefined(props.isolineRange)) {
      // clip the dataset to > 0
      params.logscale = props.isolineLogscale;
      const min = Math.max(props.isolineRange.min, Number.EPSILON);
      const max = Math.max(props.isolineRange.max, Number.EPSILON * 2);
      params.colorscalerange = `${min},${max}`;
      params.abovemaxcolor = 'transparent';
      params.belowmincolor = 'transparent';
    }
  }

  return params;
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


export { getWMSParams, getLayerMinMax };
