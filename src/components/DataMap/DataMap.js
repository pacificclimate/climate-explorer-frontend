/* eslint-disable no-trailing-spaces */
import PropTypes from 'prop-types';
import React from 'react';

import { FeatureGroup, GeoJSON } from 'react-leaflet';
import 'proj4';
import 'proj4leaflet';
import { EditControl } from 'react-leaflet-draw';

import './DataMap.css';
import LeafletNcWMSColorbarControl from '../../core/leaflet-ncwms-colorbar';
import LeafletNcWMSAutoscaleControl from '../../core/leaflet-ncwms-autoset-colorscale';
import { getLayerMinMax, getWMSParams } from '../../data-services/ncwms';
import { makeHandleLeafletRef } from '../../core/react-leaflet-utils';
import CanadaBaseMap from '../CanadaBaseMap';
import DataLayer from './DataLayer';


class DataMap extends React.Component {
  // This component provides data display layers (DataLayer) for up to two
  // variables, plus a polygon layer and polygon editing tools, all rendered
  // within a base map (CanadaBaseMap).
  // Renders its children within the base map.
  //
  // Notes:
  // - `area` is a prop and should not be stored as state in this component.
  //    This is basic React good practice, and it also simplifies the code
  //    enormously.

  static propTypes = {
    rasterDataset: PropTypes.string,
    rasterVariable: PropTypes.string,
    rasterTime: PropTypes.string,
    rasterPalette: PropTypes.string,
    rasterLogscale: PropTypes.string, // arg for ncwms: 'true' | 'false'
    rasterRange: PropTypes.object,
    onChangeRasterRange: PropTypes.func.isRequired,

    isolineDataset: PropTypes.string,
    isolineVariable: PropTypes.string,
    isolineTime: PropTypes.string,
    isolinePalette: PropTypes.string,
    numberOfContours: PropTypes.number,
    isolineLogscale: PropTypes.string, // arg for ncwms: 'true' | 'false'
    isolineRange: PropTypes.object,
    onChangeIsolineRange: PropTypes.func.isRequired,

    area: PropTypes.object,
    onSetArea: PropTypes.func.isRequired,
  };

  // Handlers for wrangling base map, data layers, and data rendering controls.
  //
  // Responsibilities:
  //
  // -- Create and add the colour bar and autoscale controls for each data
  //    layer present
  //
  //      - A data layer is present if its dataset is. This is handled by the
  //        DataLayer component, which returns a WMSTileLayer component if the
  //        dataset is present, or else null.
  //      - Each data layer, if present, has a corresponding colour bar control.
  //      - An autoscaler control always present. Each data layer present has
  //        the autoscaler control registered to it.
  //
  //      The controls must be positioned depending on which of the two data
  //      layers (or both) is present. Data layers are rendered independently
  //      of each other, so there is no single event or callback that will
  //      coordinate both layers completing (whether present or null).
  //      [Oops, except for this component's componentDidMount lifecycle event
  //      ... hmmm, probably should refactor. Probably better to wrap that in
  //      a single component DataLayers to encapsulate the complexity. Alas.]
  //      So we create a promise (this.layersPromise) that resolves when the
  //      two layers have completed; when it resolves, we create and deploy
  //      the data rendering controls.

  handleMapRef = makeHandleLeafletRef('map', (map) => {
    console.log('handleMapRef', map);
    // Set up the promises for the raster and isoline layers.
    // Each promise is resolved with either the layer or null if the layer is
    // not created (according to props). The resolve callback for each promise
    // is cached on `this` so that it can be invoked by the layer callbacks
    // later.
    const rasterLayerPromise = new Promise((resolve) => {
      this.rasterLayerResolve = resolve;
    });
    const isolineLayerPromise = new Promise((resolve) => {
      this.isolineLayerResolve = resolve;
    });
    this.layersPromise = Promise.all([rasterLayerPromise, isolineLayerPromise])
      .then(this.addDataControls);
  }).bind(this);

  handleRasterLayerRef = makeHandleLeafletRef('rasterLayer', (layer) => {
    this.rasterLayerResolve(layer);
  }).bind(this);

  handleNoRasterLayer = () => {
    this.rasterLayerResolve(undefined);
  };

  handleIsolineLayerRef = makeHandleLeafletRef('isolineLayer', (layer) => {
    this.isolineLayerResolve(layer);
  }).bind(this);

  handleNoIsolineLayer = () => {
    this.isolineLayerResolve(undefined);
  };

  addDataControls = ([rasterLayer, isolineLayer]) => {
    // Create and add the corresponding colour bar controls and the autoscale control for the layers
    // (raster, isoline, or both).
    // A colour bar is created added for each layer present.
    // The autoscale control is always created and is registered to each layer present.

    // Don't try to add controls if there's no map.
    // This isn't really necessary if everything is working, but it guards
    // against stupid or unexpected.
    if (!this.map) {
      return;
    }
    
    // Create and register controls to layer(s)
    const rasterBar = rasterLayer &&
      new LeafletNcWMSColorbarControl(rasterLayer, { position: 'bottomright' });
    const isolineBar = isolineLayer &&
      new LeafletNcWMSColorbarControl(isolineLayer, { position: 'bottomright' });
    let autoscale;
    autoscale = rasterLayer &&
      new LeafletNcWMSAutoscaleControl(rasterLayer, { position: 'bottomright' });
    if (autoscale && isolineLayer) {
      autoscale.addLayer(isolineLayer);
    } else {
      autoscale = new LeafletNcWMSAutoscaleControl(
        isolineLayer, { position: 'bottomright' });
    }

    // Add controls to map. Ordering depends on which of the controls is present.
    if (rasterBar && isolineBar) {
      this.map.addControl(rasterBar);
      this.map.addControl(autoscale);
      this.map.addControl(isolineBar);
    } else if (rasterBar || isolineBar) {
      this.map.addControl(rasterBar || isolineBar);
      this.map.addControl(autoscale);
    }
  };

  // Handlers for area selection.
  // TODO: Promote area components and handlers up a level when confirmed that
  // area is not used at this level.

  handleAreaCreatedOrEdited = (e) => {
    const area = e.layer.toGeoJSON();
    area.properties.source = 'PCIC Climate Explorer';
    this.props.onSetArea(area);
  };

  handleAreaDeleted = (e) => {
    this.props.onSetArea(undefined);
  };

  // TODO: Rename
  // TODO: Push into DataLayer
  updateLayerMinmax = (layer, props, onChangeRange) => {
    try {
      var bounds = this.map.getBounds();
      if (bounds.getWest() == bounds.getEast()) {
        // This netCDF file has an invalid bounding box, presumably because it has been
        // through a longitude normalization process.
        // See https://github.com/pacificclimate/climate-explorer-data-prep/issues/11
        // As a result, longitudes in the file go from 0 to 180, then -180 to
        // 0. This means the westmost boundary and the eastmost boundary
        // are both zero (actually -.5675 or something like that, the center of a cell
        // with one edge at 0.)
        // Passing a bounding box with identical eastmost and westmost bounds to
        // ncWMS results in an error, so create a new Canada-only bounding box and
        // ignore the worldwide extent of this map.
        var corner1 = L.latLng(90, -50);
        var corner2 = L.latLng(40, -150);
        bounds = L.latLngBounds(corner1, corner2);
      }
      getLayerMinMax(layer, props, bounds).then(response => {
        onChangeRange(response.data);
      });
    } catch (err) {
      // Because the map loads data asynchronously, it may not be ready yet,
      // throwing an error on this.map.getBounds(). This error can be safely
      // ignored: the minmax data only needs to be available by the time the
      // user opens the map options menu, and by then it should be, unless
      // something is wrong with the ncWMS server and no map rasters are
      // generated at all.
      // Any other error should be rethrown so it can be noticed and debugged.
      // NOTE: rethrowing errors loses stacktrace in Chrome, see
      // https://bugs.chromium.org/p/chromium/issues/detail?id=60240
      if (err.message != "Set map center and zoom first.") {
        throw err;
      }
    }
  };

  updateLayerRanges() {
    // TODO: Push into DataLayer
    if (this.props.rasterDataset) {
      this.updateLayerMinmax('raster', this.props, this.props.onChangeRasterRange);
    }
    if (this.props.isolineDataset) {
      this.updateLayerMinmax('isoline', this.props, this.props.onChangeIsolineRange);
    }
  }

  // Lifecycle event handlers

  componentDidMount() {
    // TODO: Push into DataLayer
    this.updateLayerRanges();
  }

  componentDidUpdate() {
    // TODO: Push into DataLayer
    this.updateLayerRanges();
  }

  render() {
    return (
      <CanadaBaseMap
        mapRef={this.handleMapRef}
      >
        <DataLayer
          dataset={this.props.rasterDataset}
          onLayerRef={this.handleRasterLayerRef}
          onNoLayer={this.handleNoRasterLayer}
          {...getWMSParams('raster', this.props)}
        />
        // TODO: Don't render the isoline data layer if no isoline dataset
        <DataLayer
          dataset={this.props.isolineDataset}
          onLayerRef={this.handleIsolineLayerRef}
          onNoLayer={this.handleNoIsolineLayer}
          {...getWMSParams('isoline', this.props)}
        />
        <FeatureGroup>
          <EditControl
            position='topleft'
            draw={{
              marker: false,
              circle: false,
              polyline: false,
            }}
            onCreated={this.handleAreaCreatedOrEdited}
            onEdited={this.handleAreaCreatedOrEdited}
            onDeleted={this.handleAreaDeleted}
          />
        </FeatureGroup>
        {
          this.props.area &&
          <GeoJSON
            data={this.props.area}
          />
        }
        { this.props.children }
      </CanadaBaseMap>
    );
  }
}

export default DataMap;
