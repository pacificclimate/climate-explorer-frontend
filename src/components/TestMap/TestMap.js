/* eslint-disable no-trailing-spaces */
import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import { WMSTileLayer, FeatureGroup, GeoJSON } from 'react-leaflet';
import 'proj4';
import 'proj4leaflet';
import { EditControl } from 'react-leaflet-draw';

import './TestMap.css';
import utils from '../Map/utils';
import LeafletNcWMSColorbarControl from '../../core/leaflet-ncwms-colorbar';
import LeafletNcWMSAutoscaleControl from '../../core/leaflet-ncwms-autoset-colorscale';
import CanadaBaseMap from '../CanadaBaseMap';
import {sameYear, timestampToTimeOfYear} from "../../core/util";


function makeHandleLeafletRef(name, leafletAction = () => {}) {
  // Return a handler that sets this[name] to the leaflet element of the component,
  // then calls an optional action function on that leaflet element.
  return function (c) {
    console.log('handleLeafletRef:', name);
    if (c) {
      let leafletElement = c.leafletElement;
      this[name] = leafletElement;
      leafletAction(leafletElement);
    }
  };
}


// TODO: Extract to separate module
function DataLayer(props) {
  console.log('DataLayer', props);
  const { dataset, onLayerRef, onNoLayer, ...wmsParams } = props;
  if (dataset) {
    return (
      <WMSTileLayer
        url={NCWMS_URL}
        {...wmsParams}
        ref={onLayerRef}
      />
    );
  }
  onNoLayer();
  return null;
}


class TestMap extends React.Component {
  // Notes:
  // - `area` is a prop and should not be stored as state in this component.
  //    This is basic React good practice, and it also simplifies the code
  //    enormously.

  static propTypes = {
    rasterPalette: PropTypes.string,
    rasterLogscale: PropTypes.string,
    isolinePalette: PropTypes.string,
    numberOfContours: PropTypes.number,
    isolineLogscale: PropTypes.string,
    rasterDataset: PropTypes.string,
    isolineDataset: PropTypes.string,
    rasterVariable: PropTypes.string,
    isolineVariable: PropTypes.string,
    onSetArea: PropTypes.func.isRequired,
    area: PropTypes.object,
  };

  // TODO: Extract to a utility module?
  getWMSParams = (layer, props = this.props) => {
    var layerName = props[`${layer}Dataset`] + "/" + props[`${layer}Variable`];

    var params = {
      layers: layerName,
      noWrap: true,
      format: "image/png",
      transparent: true,
      time: props[`${layer}Time`],
      numcolorbands: 249,
      version: "1.1.1",
      srs: "EPSG:4326",
      logscale: "false"
    };
    if(layer == "raster") {
      params.styles = `default-scalar/${props.rasterPalette}`;
      params.opacity = .7;
      if (props.rasterLogscale=="true" && false && !_.isUndefined(this.layerRange.raster)) {
        // clip the dataset to > 0, values of 0 or less do not have a
        // non-complex logarithm
        params.logscale = props.rasterLogscale;
        var min = Math.max(this.layerRange.raster.min, Number.EPSILON);
        var max = Math.max(this.layerRange.raster.max, Number.EPSILON * 2);
        params.colorscalerange = `${min},${max}`;
        params.abovemaxcolor="transparent";
        params.belowmincolor="transparent";
      }
    } else if (layer == "isoline") {
      params.styles = `colored_contours/${props.isolinePalette}`;
      params.numContours = props.numberOfContours;
      params.opacity = 1;
      if (props.isolineLogscale=="true" && !_.isUndefined(this.layerRange.isoline)) {
        // clip the dataset to > 0
        params.logscale = props.isolineLogscale;
        var min = Math.max(this.layerRange.isoline.min, Number.EPSILON);
        var max = Math.max(this.layerRange.isoline.max, Number.EPSILON * 2);
        params.colorscalerange = `${min},${max}`;
        params.abovemaxcolor="transparent";
        params.belowmincolor="transparent";
      }
    }
    return params;
  };

  // Handlers for wrangling base map, data layers, and data rendering controls.
  //
  // Responsibilities:
  //
  // -- Create and add the colour bar and autoscale controls for each data layer present
  //
  //      - A data layer is present if its dataset is. This is handled by the DataLayer component, which returns a
  //        a WMSTileLayer component if the dataset is present, or else null.
  //      - Each data layer, if present, has a corresponding colour bar control.
  //      - An autoscaler control always present. Each data layer present has the autoscaler control registered to it.
  //
  //      The controls must be positioned depending on which of the two data layers (or both) is present. Data
  //      layers are rendered independently of each other, so there is no single event or callback that will coordinate
  //      both layers completing (whether present or null). [Oops, except for this component's componentDidMount
  //      lifecycle event ... hmmm, probably should refactor. Probably better to wrap that in a single component
  //      DataLayers to encapsulate the complexity. Alas.] So we create a promise (this.layersPromise) that resolves
  //      when the two layers have completed; when it resolves, we create and deploy the data rendering controls.

  handleMapRef = makeHandleLeafletRef('map', (map) => {
    console.log('handleMapRef', map);
    // Set up the promises for the raster and isoline layers.
    // Each promise is resolved with either the layer or null if the layer is not created (according to props).
    // The resolve callback for each promise is cached on `this` so that it can be invoked by the layer callbacks
    // later.
    const rasterLayerPromise = new Promise((resolve) => {
      this.rasterLayerResolve = resolve;
    });
    const isolineLayerPromise = new Promise((resolve) => {
      this.isolineLayerResolve = resolve;
    });
    this.layersPromise = Promise.all([rasterLayerPromise, isolineLayerPromise]).then(this.addDataControls);
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
    
    // Create and register controls to layer(s)
    const rasterBar = rasterLayer && new LeafletNcWMSColorbarControl(rasterLayer, { position: 'bottomright' });
    const isolineBar = isolineLayer && new LeafletNcWMSColorbarControl(isolineLayer, { position: 'bottomright' });
    let autoscale;
    autoscale = rasterLayer && new LeafletNcWMSAutoscaleControl(rasterLayer, { position: 'bottomright' });
    if (autoscale && isolineLayer) {
      autoscale.addLayer(isolineLayer);
    } else {
      autoscale = new LeafletNcWMSAutoscaleControl(isolineLayer, { position: 'bottomright' });
    }

    // Add controls to map. Ordering depends on which of the controls is present.
    if (rasterBar && isolineBar) {
      this.map.addControl(rasterBar);
      this.map.addControl(autoscale);
      this.map.addControl(isolineBar);
    } else {
      this.map.addControl(rasterBar || isolineBar);
      this.map.addControl(autoscale);
    }
  };

  // Handlers for area selection.

  handleAreaCreatedOrEdited = (e) => {
    const area = e.layer.toGeoJSON();
    area.properties.source = 'PCIC Climate Explorer';
    this.props.onSetArea(area);
  };

  handleAreaDeleted = (e) => {
    this.props.onSetArea(undefined);
  };


  render() {
    return (
        <div style={{width: 800, height: 600}}>
          <CanadaBaseMap
            mapRef={this.handleMapRef}
          >
            <DataLayer
              dataset={this.props.rasterDataset}
              onLayerRef={this.handleRasterLayerRef}
              onNoLayer={this.handleNoRasterLayer}
              {...this.getWMSParams('raster')}
            />
            <DataLayer
              dataset={this.props.isolineDataset}
              onLayerRef={this.handleIsolineLayerRef}
              onNoLayer={this.handleNoIsolineLayer}
              {...this.getWMSParams('isoline')}
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
      </div>
    );
  }
}

export default TestMap;
