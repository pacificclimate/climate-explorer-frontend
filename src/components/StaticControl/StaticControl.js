import ReactDom from 'react-dom';

import { MapControl } from 'react-leaflet';
import L from 'leaflet';

import './StaticControl.css';


class StaticControl extends MapControl {
    createLeafletElement(props) {
      const leafletElement = L.control({ position: props && props.position });

      leafletElement.onAdd = map => {
        this.container = L.DomUtil.create(
          'div',
          'StaticControl leaflet-control'
        );
        Object.assign(this.container.style, props.style);
        ReactDom.render(props.children, this.container);
        return this.container;
      };

      return leafletElement;
    }

    updateLeafletElement(fromProps, toProps) {
      if (fromProps.children !== toProps.children) {
        ReactDom.render(toProps.children, this.container);
      }
    }
}

export default StaticControl;
