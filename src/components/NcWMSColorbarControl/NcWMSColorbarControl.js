import React from 'react';  // Necessary?

import { MapControl } from 'react-leaflet';

import LeafletNcWMSColorbarControl from './LeafletNcWMSColorbarControl';


// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/123
class NcWMSColorbarControl extends MapControl {
  createLeafletElement(props) {
    return new LeafletNcWMSColorbarControl(props);
  }

  updateLeafletElement(fromProps, toProps) {
    this.leafletElement.update(toProps);
  }
}

export default NcWMSColorbarControl;
