import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import 'proj4';
import 'proj4leaflet';
import { EditControl } from 'react-leaflet-draw';

import GeoLoader from '../GeoLoader';
import GeoExporter from '../GeoExporter';

import './DataMap.css';
import { getLayerMinMax } from '../../data-services/ncwms';
import {
  makeHandleLeafletRef,
  updateSingleStateLeaflet,
} from '../../core/react-leaflet-utils';
import CanadaBaseMap from '../CanadaBaseMap';
import DataLayer from './DataLayer';
import NcWMSColorbarControl from '../NcWMSColorbarControl';
import NcWMSAutosetColorscaleControl from '../NcWMSAutosetColorscaleControl';
import { layerParamsPropTypes } from '../../types/types.js';
import LayerControlledFeatureGroup from '../LayerControlledFeatureGroup';
import StaticControl from '../StaticControl';

// For testing TODO: Remove
import { Button } from 'react-bootstrap';
import { Polygon as LeafletPolygon } from 'leaflet';
import { geoJSONToLeafletLayers } from '../../core/geoJSON-leaflet';

class DataMap extends React.Component {
  // This component provides data display layers (DataLayer) for up to two
  // variables, plus a polygon layer and polygon editing tools, all rendered
  // within a base map (CanadaBaseMap).
  // Renders its children within the base map.

  static propTypes = {
    raster: layerParamsPropTypes,
    isoline: layerParamsPropTypes,
    annotated: layerParamsPropTypes,
    area: PropTypes.object,
    onSetArea: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      rasterLayer: null,
      isolineLayer: null,
      annotatedLayer: null,
      geometryLayers: [],
    };
  }

  // Handler for base map ref.

  handleMapRef = makeHandleLeafletRef('map').bind(this);

  // Handlers for data layer refs.

  // TODO: Push into DataLayer? Difficulty because map isn't in React
  // context of DataLayer, despite what one might expect from React Leaflet
  // documentation.
  // It's not so bad here, but would be better there.
  updateLayerRange = (layerType, props, onChangeRange) => {
    try {
      let bounds = this.map.getBounds();
      if (bounds.getWest() === bounds.getEast()) {
        // This netCDF file has an invalid bounding box, presumably because it has been
        // through a longitude normalization process.
        // See https://github.com/pacificclimate/climate-explorer-data-prep/issues/11
        // As a result, longitudes in the file go from 0 to 180, then -180 to
        // 0. This means the westmost boundary and the eastmost boundary
        // are both zero (actually -.5675 or something like that, the center of a cell
        // with one edge at 0.)
        // Passing a bounding box with identical eastmost and westmost bounds to
        // ncWMS results in an error, so create a new Canada-only bounding box and
        // ignore the worldwide extent o[[-122.949219,63.632813],[-113.769531,68.222656],[-110.742187,63.242187],[-122.949219,63.632813]]f this map.
        const corner1 = L.latLng(90, -50);
        const corner2 = L.latLng(40, -150);
        bounds = L.latLngBounds(corner1, corner2);
      }
      getLayerMinMax(layerType, props, bounds).then(response => {
        onChangeRange(response.data);
      });
    } catch (err) {
      // TODO: This whole try-catch block might be unnecessary now
      // that this function is invoked only on layer load event.
      // Because the map loads data asynchronously, it may not be ready yet,
      // throwing an error on this.map.getBounds(). This error can be safely
      // ignored: the minmax data only needs to be available by the time the
      // user opens the map options menu, and by then it should be, unless
      // something is wrong with the ncWMS server and no map rasters are
      // generated at all.
      // Any other error should be rethrown so it can be noticed and debugged.
      // NOTE: rethrowing errors loses stacktrace in Chrome, see
      // https://bugs.chromium.org/p/chromium/issues/detail?id=60240
      if (err.message !== 'Set map center and zoom first.') {
        throw err;
      }
    }
  };

  handleLayerRef(layerType, layer) {
    const leafletElement = layer && layer.leafletElement;
    if (leafletElement) {
      const onChangeRange = this.props[layerType].onChangeRange;
      leafletElement.on('load', () => {
        this.updateLayerRange(layerType, this.props, onChangeRange);
      });
    }
    this.setState({ [`${layerType}Layer`]: leafletElement });  // Ewww
  }

  handleRasterLayerRef = this.handleLayerRef.bind(this, 'raster');
  handleIsolineLayerRef = this.handleLayerRef.bind(this, 'isoline');
  handleAnnotatedLayerRef = this.handleLayerRef.bind(this, 'annotated');

  // Handlers for area selection. Converts area to GeoJSON.

  layersToGeoJSON = (layers) => ({
    type: 'Feature',
    geometry: {
      type: 'GeometryCollection',
      geometries: layers.map(layer => layer.toGeoJSON()),
    },
  });

  onSetArea = () => {
    // const area = this.layersToGeoJSON(this.state.geometryLayers);
    // TODO: Fix this ...
    // The thing that receives this GeoJSON doesn't like GeometryCollections.
    // Right now we are therefore only updating with the first Feature, i.e.,
    // first layer. This is undesirable. Best would be to fix the receiver
    // to handle feature selections; next
    const layer0 = this.state.geometryLayers[0];
    const area = layer0 && layer0.toGeoJSON();
    console.log('onSetArea', area);
    this.props.onSetArea(area);
  };

  addGeometryLayer = layer => {
    let geometryLayers;
    this.setState(prevState => {
      geometryLayers = prevState.geometryLayers.concat([layer]);
      console.log('addGeometryLayer layer =', layer)
      console.log('addGeometryLayer prevState.geometryLayers =', prevState.geometryLayers)
      console.log('addGeometryLayer newGeometryLayers =', geometryLayers);
      return { geometryLayers };
    }, this.onSetArea);
  };

  addGeometryLayers = layers => {
    for (const layer of layers) {
      this.addGeometryLayer(layer);
    }
  };

  deleteGeometryLayers = layers => {
    let geometryLayers;
    this.setState(prevState => {
      geometryLayers = _.without(prevState.geometryLayers, ...layers);
      console.log('deleteGeometryLayers layers =', layers)
      console.log('deleteGeometryLayers prevState.geometryLayers =', prevState.geometryLayers)
      console.log('deleteGeometryLayers newGeometryLayers =', geometryLayers);
      return { geometryLayers };
    }, this.onSetArea);
  };

  handleAreaCreated = e => this.addGeometryLayer(e.layer);

  handleAreaEdited = e => {
    // May not need to do anything to maintain `state.geometryLayers` here.
    // The contents of the layers are changed, but the layers themselves
    // (as identities) are not changed in number or identity.
    // `geometryLayers` is a list of such identities, so doesn't need to change.
    // Only need to communicate change via onSetArea.
    // Maybe not; maybe better to create a new copy of geometryLayers. Hmmm.
    console.log('handleAreaEdited', this.state.geometryLayers);
    this.onSetArea();
  };

  handleAreaDeleted = e => {
    let layers = [];
    e.layers.eachLayer(layer => layers.push(layer));
    this.deleteGeometryLayers(layers);
  };

  // TODO: Remove
  testPolygon = () => new LeafletPolygon([
    [50.449219,-127.514648,],[52.426758,-127.514648,],
    [52.426758,-125.024414,],[50.449219,-125.024414,]
  ]);

  handleUploadArea = (geoJSON) => {
    this.addGeometryLayers(geoJSONToLeafletLayers(geoJSON));
  };

  // Lifecycle event handlers

  shouldComponentUpdate(nextProps, nextState) {
    const propChange = !_.isEqual(nextProps, this.props);
    const stateChange = !_.isEqual(nextState, this.state);
    const b = propChange || stateChange;
    return b;
  }
  
  // Helper function for render, generates JSX for DataLayer
  dataLayerProps(layertype) {
    if(_.isUndefined(this.props[layertype])) {
      return "";
    }
    else {
      const handlerName = `handle${layertype.charAt(0).toUpperCase() + layertype.slice(1)}LayerRef`;
      return (
          <DataLayer
            layerType={layertype}
            {...this.props[layertype]}
            onLayerRef={this[handlerName]}
          />
      );
    }
  }

  render() {
    // TODO: Add positioning for autoset
    return (
      <CanadaBaseMap
        mapRef={this.handleMapRef}
      >
        {
          ['raster', 'isoline', 'annotated'].map(lType => {
            if (!_.isUndefined(this.props[lType])) {
                return (
                  <DataLayer
                    layerType={lType}
                    layerParams={this.props[lType]}
                    onLayerRef={this.handleLayerRef.bind(this, lType)}
                  />
                );
              }
            }
          )
        }

        <NcWMSColorbarControl
          layer={this.state.rasterLayer}
          {...this.props.raster}  // update when any raster prop changes
        />

        <NcWMSAutosetColorscaleControl
          layers={[this.state.rasterLayer, this.state.isolineLayer]}
        />

        <NcWMSColorbarControl
          layer={this.state.isolineLayer}
          {...this.props.isoline}  // update when any isoline prop changes
        />

        <LayerControlledFeatureGroup
          layers={this.state.geometryLayers}
        >
          <EditControl
            position='topleft'
            draw={{
              marker: false,
              circle: false,
              polyline: false,
            }}
            onCreated={this.handleAreaCreated}
            onEdited={this.handleAreaEdited}
            onDeleted={this.handleAreaDeleted}
          />
        </LayerControlledFeatureGroup>

        {/* TODO: Remove */}
        <StaticControl position='topleft'>
          <Button
            onClick={
              () => this.addGeometryLayer(this.testPolygon())
            }
          >
            Foo
          </Button>
        </StaticControl>

        <StaticControl position='topleft'>
          <GeoLoader
            onLoadArea={this.handleUploadArea}
            title='Import polygon'
          />
        </StaticControl>

        <StaticControl position='topleft'>
          <GeoExporter area={this.props.area} title='Export polygon' />
        </StaticControl>

        { this.props.children }

      </CanadaBaseMap>
    );
  }
}

export default DataMap;
