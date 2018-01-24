import PropTypes from 'prop-types';
import React from 'react';

import { WMSTileLayer } from 'react-leaflet';
import { getIsolineWMSParams, getRasterWMSParams } from '../../data-services/ncwms';


export default class DataLayer extends React.Component {
  static propTypes = {
    // Layer props
    layerType: PropTypes.string, // 'raster' | 'isoline'
    dataset: PropTypes.string,
    variable: PropTypes.string,
    time: PropTypes.string,
    palette: PropTypes.string,
    logscale: PropTypes.string,
    range: PropTypes.object,

    onLayerRef: PropTypes.func,
    onNoLayer: PropTypes.func.isRequired,

    onChangeRange: PropTypes.func.isRequired,
  };


  render() {
    console.log('DataLayer', this.props);
    const {
      onLayerRef, onNoLayer, onChangeRange, layerType, ...layerParams,
    } = this.props;

    // TODO: This dispatcher belongs in data-services/ncwms
    const wmsParams = {
      raster: getRasterWMSParams,
      isoline: getIsolineWMSParams,
    }[layerType](layerParams);

    if (layerParams.dataset) {
      return (
        <WMSTileLayer
          url={NCWMS_URL}
          {...wmsParams}
          ref={onLayerRef}
        />
      );
    }

    onNoLayer();
    return null;
  }
}
