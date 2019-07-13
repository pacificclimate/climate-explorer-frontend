import PropTypes from 'prop-types';
import React from 'react';

import { WMSTileLayer } from 'react-leaflet';
import {
  getIsolineWMSParams, getRasterWMSParams, getAnnotatedWMSParams,
} from '../../data-services/ncwms';
import _ from 'lodash';
import { layerParamsPropTypes } from '../../types/types.js';

export default class DataLayer extends React.Component {
  static propTypes = {
    // Layer props
    layerType: PropTypes.string.isRequired, //'annotated', 'isoline', or 'raster'
    layerParams: layerParamsPropTypes,
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
      onLayerRef, layerType, layerParams,
    } = this.props;

    // TODO: This dispatcher belongs in data-services/ncwms
    const wmsParams = {
      raster: getRasterWMSParams,
      isoline: getIsolineWMSParams,
      annotated: getAnnotatedWMSParams,
    }[layerType](layerParams);

    if (layerParams && layerParams.dataset) {
      return (
        <WMSTileLayer
          url={process.env.REACT_APP_NCWMS_URL}
          {...wmsParams}
          ref={onLayerRef}
        />
      );
    }

    onLayerRef(null);
    return null;
  }
}
