import { MapControl, withLeaflet } from 'react-leaflet';

import LeafletNcWMSAutosetColorscaleControl from './LeafletNcWMSAutosetColorscaleControl';

// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/123
class NcWMSAutosetColorscaleControl extends MapControl {
  createLeafletElement(props) {
    return new LeafletNcWMSAutosetColorscaleControl(props);
  }

  updateLeafletElement(fromProps, toProps) {
    this.leafletElement.update(toProps);
  }
}

export default withLeaflet(NcWMSAutosetColorscaleControl);
