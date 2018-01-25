import React from 'react';  // Necessary?

import { MapControl } from 'react-leaflet';

import LeafletNcWMSAutosetColorscaleControl from './LeafletNcWMSAutosetColorscaleControl';

// TODO: Replace with a StaticControl like MapSettings?
class NcWMSAutosetColorscaleControl extends MapControl {
  createLeafletElement(props) {
    return new LeafletNcWMSAutosetColorscaleControl(props);
  }

  updateLeafletElement(fromProps, toProps) {
    this.leafletElement.update(toProps);
  }
}

export default NcWMSAutosetColorscaleControl;
