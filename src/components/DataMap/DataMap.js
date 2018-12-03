// This component provides data display layers (DataLayer) for up to two
// variables, plus a geometry layer, geometry creation and editing tools,
// and geometry import/export tools, all rendered within the base map
// (CanadaBaseMap).
//
// Renders its children within the base map.
//
// Notes on geometry layer group:
//
//  Terminology
//
//  - Leaflet uses the term 'layer' for all single polygons, markers, etc.
//    Leaflet uses the term 'layer group' for an object (iteself also a
//    layer, i.e, a subclass of `Layer`) that groups layers together.
//
//  Purpose
//
//  - The purpose of the geometry layer group is to allow the user to define
//    a spatial area of interest. This area drives the spatial data averaging
//    performed by various other data display tools (graphs, tables).
//
//  Behaviour
//
//  - The geometry layer group is initially empty. Geometry can be added to
//    it by any combination of drawing (on the map), uploading (e.g., a
//    from GeoJSON file), and editing and/or deleting existing geometry.
//
//  `onSetArea` callback
//
//  - All changes (add, edit) to the contents of the geometry layer group are
//    communicated by the `DataMap` callback prop `onSetArea`. This callback
//    is more or less the whole point of the geometry layer group.
//
//  - `onSetArea` is called with a single GeoJSON object representing the the
//    contents of the layer group. But see next point.
//
//  - Currently only one geometry item (layer), the first created, is passed to
//    `onSetArea`. All other layers are ignored. This is because the receiver(s)
//    (ultimately) of the object passed can handle only a single feature.
//    This is
//
//      (a) a failing of the receivers, which possibly can be rectified,
//      (b) not a good design, in that `DataMap` shouldn't have to know that
//        some other component external to it is crippled. Filtering the
//        contents of the geometry layer group should happen outside this
//        component, not within. Alas.
//
//  - `DataMap` currently receives a prop `area`, which, alongside `onSetArea`,
//    suggests that `DataMap` is a controlled component with respect to
//    `area`. It is not. The `area` prop is currently entirely ignored.
//    TODO: The `area` prop should probably be removed.
//
//  Geometry upload and download
//
//  - In order to integrate upload and download of geometry with the
//    geometry editing tool, a new React Leaflet component,
//    `LayerControlledFeatureGroup`, has been created. As its name implies,
//    its contents are controlled by a prop `layers`.
//
//    - The `LayerControlledFeatureGroup` prop `layers`  is controlled
//    by `DataMap` state `geometryLayers`, which is maintained according to
//    what is communicated by callbacks from the geometry layer group
//    draw/edit and upload tools.
//
//  - The geometry export (download) feature (`GeoExporter` component), like
//    `onSetArea`, exports only the first geometry item present in the
//    geometry layer group. See `onSetArea` for more details.
//

import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import 'proj4';
import 'proj4leaflet';
import { LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import GeoLoader from '../GeoLoader';
import GeoExporter from '../GeoExporter';

import './DataMap.css';

import { getLayerMinMax } from '../../data-services/ncwms';
import { makeHandleLeafletRef } from '../../core/react-leaflet-utils';
import CanadaBaseMap from '../CanadaBaseMap';
import DataLayer from './DataLayer';
import NcWMSColorbarControl from '../NcWMSColorbarControl';
import NcWMSAutosetColorscaleControl from '../NcWMSAutosetColorscaleControl';
import { layerParamsPropTypes } from '../../types/types.js';
import LayerControlledFeatureGroup from '../LayerControlledFeatureGroup';
import StaticControl from '../StaticControl';

import { geoJSONToLeafletLayers } from '../../core/geoJSON-leaflet';

class DataMap extends React.Component {
  static propTypes = {
    raster: layerParamsPropTypes,
    isoline: layerParamsPropTypes,
    annotated: layerParamsPropTypes,
    area: PropTypes.object,
    onSetArea: PropTypes.func.isRequired,
    activeGeometryStyle: PropTypes.string.isRequired,
    inactiveGeometryStyle: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    activeGeometryStyle: { color: '#3388ff' },
    inactiveGeometryStyle: { color: '#777777' },
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
        // This netCDF file has an invalid bounding box, presumably because
        // it has been through a longitude normalization process.
        // See https://github.com/pacificclimate/climate-explorer-data-prep/issues/11
        // As a result, longitudes in the file go from 0 to 180, then -180 to
        // 0. This means the westmost boundary and the eastmost boundary
        // are both zero (actually -.5675 or something like that, the center
        // of a cell with one edge at 0.)
        // Passing a bounding box with identical eastmost and westmost bounds
        // to ncWMS results in an error, so create a new Canada-only bounding
        // box and ignore the worldwide extent
        // [[-122.949219,63.632813],[-113.769531,68.222656],
        // [-110.742187,63.242187],[-122.949219,63.632813]]
        // of this map.
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

  // Handlers for area selection. Converts area to GeoJSON.

  layersToArea = (layers) => {
    // const area = layersToGeoJSON('GeometryCollection', layers);
    // const area = layersToGeoJSON('FeatureCollection', layers);
    // TODO: Fix this ...
    // The thing that receives this GeoJSON doesn't like `FeatureCollection`s
    // or `GeometryCollection`s.
    // Right now we are therefore only updating with the first Feature, i.e.,
    // first layer. This is undesirable. Best would be to fix the receiver
    // to handle feature selections; next
    const layer0 = layers[0];
    return layer0 && layer0.toGeoJSON();
  };

  onSetArea = () => {
    this.props.onSetArea(this.layersToArea(this.state.geometryLayers));
  };

  layerStyle = (index) => index > 0 ?
    this.props.inactiveGeometryStyle :
    this.props.activeGeometryStyle;

  addGeometryLayer = layer => {
    this.setState(prevState => {
      layer.setStyle(this.layerStyle(prevState.geometryLayers.length));
      return { geometryLayers: prevState.geometryLayers.concat([layer]) };
    }, this.onSetArea);
  };

  addGeometryLayers = layers => {
    for (const layer of layers) {
      this.addGeometryLayer(layer);
    }
  };

  editGeometryLayers = layers => {
    // May not need to do anything to maintain `state.geometryLayers` here.
    // The contents of the layers are changed, but the layers themselves
    // (as identities) are not changed in number or identity.
    // `geometryLayers` is a list of such identities, so doesn't need to change.
    // Only need to communicate change via onSetArea.
    // Maybe not; maybe better to create a new copy of geometryLayers. Hmmm.
    this.onSetArea();
  };

  deleteGeometryLayers = layers => {
    this.setState(prevState => {
      const geometryLayers = _.without(prevState.geometryLayers, ...layers);
      geometryLayers.forEach((layer, i) => layer.setStyle(this.layerStyle(i)));
      return { geometryLayers };
    }, this.onSetArea);
  };

  eventLayers = e => {
    // Extract the Leaflet layers from an editing event, returning them
    // as an array of layers.
    // Note: `e.layers` is a special class, not an array of layers, so we
    // have to go through this rigmarole to get the layers.
    // The alternative of accessing the private property `e.layers._layers`
    // (a) is naughty, and (b) fails.
    let layers = [];
    e.layers.eachLayer(layer => layers.push(layer));
    return layers;
  }

  handleAreaCreated = e => this.addGeometryLayer(e.layer);
  handleAreaEdited = e => this.editGeometryLayers(this.eventLayers(e));
  handleAreaDeleted = e => this.deleteGeometryLayers(this.eventLayers(e));

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

  render() {
    // TODO: Add positioning for autoset

    const dataLayers = ['raster', 'isoline', 'annotated'].map(layerType => (
      this.props[layerType] && (
        <LayersControl.Overlay
          name={`Climate ${layerType}`}
          checked={true}
        >
          <DataLayer
            layerType={layerType}
            layerParams={this.props[layerType]}
            onLayerRef={this.handleLayerRef.bind(this, layerType)}
          />
        </LayersControl.Overlay>
      )
    ));

    const allowGeometryDraw = this.state.geometryLayers.length === 0;

    return (
      <CanadaBaseMap
        mapRef={this.handleMapRef}
      >
        <LayersControl>
          {dataLayers}
        </LayersControl>

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

        {
          allowGeometryDraw &&
          <StaticControl position='topleft'>
              <GeoLoader
                onLoadArea={this.handleUploadArea}
                title='Import polygon'
              />
          </StaticControl>
        }

        <LayerControlledFeatureGroup
          layers={this.state.geometryLayers}
        >
          <EditControl
            position='topleft'
            draw={{
              marker: false,
              circlemarker: false,
              circle: false,
              polyline: false,
              polygon: allowGeometryDraw && {
                showArea: false,
                showLength: false,
              },
              rectangle: allowGeometryDraw && {
                showArea: false,
                showLength: false,
              },
            }}
            onCreated={this.handleAreaCreated}
            onEdited={this.handleAreaEdited}
            onDeleted={this.handleAreaDeleted}
          />
        </LayerControlledFeatureGroup>

        {
          // See comments at module head regarding current GeoExporter
          // arrangement.
          !allowGeometryDraw &&
          <StaticControl position='topleft'>
              <GeoExporter
                area={this.layersToArea(this.state.geometryLayers)}
                title='Export polygon'
              />
          </StaticControl>
        }

        { this.props.children }

      </CanadaBaseMap>
    );
  }
}

export default DataMap;
