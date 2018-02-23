import PropTypes from 'prop-types';
import React from 'react';

import { WMSTileLayer } from 'react-leaflet';
import { getIsolineWMSParams, getRasterWMSParams, getAnnotatedWMSParams } from '../../data-services/ncwms';
import _ from "underscore";


export default class DataLayer extends React.Component {
  static propTypes = {
    // Layer props
    layerType: PropTypes.string.isRequired, // 'raster' | 'isoline' | 'annotated'
    dataset: PropTypes.string,
    variableId: PropTypes.string,
    wmsTime: PropTypes.string,
    palette: PropTypes.string,
    logscale: PropTypes.string,
    range: PropTypes.object,
    onChangeRange: PropTypes.func.isRequired,

    onLayerRef: PropTypes.func,
  };

  shouldComponentUpdate(nextProps, nextState) {
    const propChange = !_.isEqual(nextProps, this.props);
    const stateChange = !_.isEqual(nextState, this.state);
    const b = propChange || stateChange;
    return b;
  }

  render() {
    const {
      onLayerRef, onChangeRange, layerType, ...layerParams,
    } = this.props;

    // TODO: This dispatcher belongs in data-services/ncwms
    const wmsParams = {
      raster: getRasterWMSParams,
      isoline: getIsolineWMSParams,
      annotated: getAnnotatedWMSParams
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

    onLayerRef(null);
    return null;
  }
}