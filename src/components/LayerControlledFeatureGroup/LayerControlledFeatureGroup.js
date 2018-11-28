// React component wrapping Leaflet `FeatureGroup`, with an explicit `layers`
// prop that controls its layer content.
//
// The `layers` prop must contain an array of Leaflet layers (and not of React
// Leaflet components). Default is an empty array.
//
// Note: This component uses the `layers` (first) argument of `L.FeatureGroup`
// to initialize the layers when created. But the component does not confine
// itself to just initialization; any change to the component prop `layers`
// causes the layers content of the feature group to be updated.

import PropTypes from 'prop-types';
import React from 'react';

import { Path, withLeaflet } from 'react-leaflet';
import { FeatureGroup as LeafletFeatureGroup } from 'leaflet';

import _ from 'underscore';


class ExtendedFeatureGroup extends Path {
  static propTypes = {
    // Array of *Leaflet* layers. Controls content of Feature Group.
    layers: PropTypes.arrayOf(PropTypes.object),
    // ... plus a lot more props that are options for the Leaflet FeatureGroup
  };

  static defaultProps = {
    layers: [],
  };

  createLeafletElement(props) {
    console.log('ExtendedFeatureGroup props=', props);
    const { layers, ...rest } = props;
    console.log('ExtendedFeatureGroup layers=', layers);
    const leafletLayers = layers;
    // const leafletLayers = [poly];
    console.log('ExtendedFeatureGroup leafletLayers=', leafletLayers);
    const options = this.getOptions(rest);
    console.log('ExtendedFeatureGroup options=', options);
    // const el = new LeafletFeatureGroup(options);
    const el = new LeafletFeatureGroup(leafletLayers, options);
    this.contextValue = {
      ...props.leaflet,
      layerContainer: el,
      popupContainer: el,
    };
    return el;
  }

  componentDidUpdate() {
    super.componentDidUpdate();
    this.leafletElement.clearLayers();
    for (const layer of this.props.layers) {
      this.leafletElement.addLayer(layer);
    }
  }
}

export default withLeaflet(ExtendedFeatureGroup);
