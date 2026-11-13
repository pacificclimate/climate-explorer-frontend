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
//  - GeomanControl synchronizes the native Leaflet selection group with
//    state `geometryLayers`, including uploaded geometry. Its callbacks
//    report creation, editing and removal without exposing Geoman events.
//
//  - The geometry export (download) feature (`GeoExporter` component), like
//    `onSetArea`, exports only the first geometry item present in the
//    geometry layer group. See `onSetArea` for more details.
//

import PropTypes from "prop-types";
import React from "react";

import _ from "lodash";

import L from "../../core/leaflet";
import GeomanControl from "../GeomanControl/GeomanControl";

import GeoLoader from "../GeoLoader/GeoLoader.js";
import GeoExporter from "../GeoExporter/GeoExporter.js";

import { getLayerMinMax } from "../../data-services/ncwms";
import { makeHandleLeafletRef } from "../../core/react-leaflet-utils";
import CanadaBaseMap from "../CanadaBaseMap/CanadaBaseMap.jsx";
import DataLayer from "./DataLayer";
import NcWMSColorbarControl from "../NcWMSColorbarControl/NcWMSColorbarControl.js";
import NcWMSAutosetColorscaleControl from "../NcWMSAutosetColorscaleControl/NcWMSAutosetColorscaleControl.js";
import { layerParamsPropTypes } from "../../types/types.js";
import StaticControl from "../StaticControl/StaticControl.jsx";

import { geoJSONToLeafletLayers } from "../../core/geoJSON-leaflet";
import LayerOpacityControl from "../LayerOpacityControl/LayerOpacityControl.jsx";

import { getWatershed } from "../../data-services/ce-backend";
import { validateWatershedData } from "../../core/util";

import "./DataMap.css";

class DataMap extends React.Component {
  static propTypes = {
    raster: layerParamsPropTypes,
    isoline: layerParamsPropTypes,
    annotated: layerParamsPropTypes,
    area: PropTypes.object,
    onSetArea: PropTypes.func.isRequired,
    activeGeometryStyle: PropTypes.object.isRequired,
    inactiveGeometryStyle: PropTypes.object.isRequired,
    children: PropTypes.node,
    pointSelect: PropTypes.bool,
    watershedEnsemble: PropTypes.string,
  };

  static defaultProps = {
    activeGeometryStyle: { color: "#3388ff" },
    inactiveGeometryStyle: { color: "#777777" },
    watershedGeometryStyle: { color: "#000000" },
    pointSelect: false,
  };

  static layerTypes = ["raster", "isoline", "annotated"];

  constructor(props) {
    super(props);

    this.state = {
      map: null,
      rasterLayer: null,
      isolineLayer: null,
      annotatedLayer: null,
      geometryLayers: [],
      layerOpacity: {},
    };

    for (const layerType of DataMap.layerTypes) {
      if (props[layerType]) {
        this.state.layerOpacity[layerType] = props[layerType].defaultOpacity;
      }
    }
    this.layerRefs = {};
    this.layerLoadHandlers = {};
    this.handleLayerRefs = Object.fromEntries(
      DataMap.layerTypes.map((layerType) => [
        layerType,
        (layer) => this.handleLayerRef(layerType, layer),
      ]),
    );
  }

  displayWatershedBoundary = () =>
    this.props.pointSelect && this.props.watershedEnsemble;

  // Handler for base map ref.

  handleMapRef = makeHandleLeafletRef("map", (map) =>
    this.setState({ map }),
  ).bind(this);

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
      getLayerMinMax(layerType, props, bounds).then((response) => {
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
      if (err.message !== "Set map center and zoom first.") {
        throw err;
      }
    }
  };

  handleLayerRef(layerType, layer) {
    const previousLayer = this.layerRefs[layerType];
    if (previousLayer === layer) return;
    if (previousLayer) {
      previousLayer.off("load", this.layerLoadHandlers[layerType]);
    }
    this.layerRefs[layerType] = layer;
    if (layer) {
      const handleLoad = () => {
        const onChangeRange = this.props[layerType]?.onChangeRange;
        if (onChangeRange) {
          this.updateLayerRange(layerType, this.props, onChangeRange);
        }
      };
      this.layerLoadHandlers[layerType] = handleLoad;
      layer.on("load", handleLoad);
    }
    this.setState({ [`${layerType}Layer`]: layer }); // Ewww
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

  layerStyle = (index) => {
    if (index === 0) {
      return this.props.activeGeometryStyle;
    } else if (this.displayWatershedBoundary()) {
      return this.props.watershedGeometryStyle;
    } else {
      return this.props.inactiveGeometryStyle;
    }
  };

  addGeometryLayer = (layer) => {
    this.setState((prevState) => {
      layer.setStyle(this.layerStyle(prevState.geometryLayers.length));
      return { geometryLayers: prevState.geometryLayers.concat([layer]) };
    }, this.onSetArea);
  };

  addGeometryLayers = (layers, outlet) => {
    this.setState((prevState) => {
      // React 18 may batch outlet creation with a fast watershed response.
      // Check pending state, while still ignoring responses for deleted outlets.
      if (outlet && !prevState.geometryLayers.includes(outlet)) return null;
      layers.forEach((layer, index) => {
        layer.setStyle(
          this.layerStyle(prevState.geometryLayers.length + index),
        );
      });
      return { geometryLayers: prevState.geometryLayers.concat(layers) };
    }, this.onSetArea);
  };

  deleteGeometryLayers = (layers) => {
    this.setState((prevState) => {
      const geometryLayers = _.without(prevState.geometryLayers, ...layers);
      geometryLayers.forEach((layer, i) => layer.setStyle(this.layerStyle(i)));
      return { geometryLayers };
    }, this.onSetArea);
  };

  handleAreaCreated = (layer) => {
    //add the watershed boundary to the map if relevant
    if (this.displayWatershedBoundary()) {
      // get the latitude and longitude of the new point from its layer object
      // we know the layer is a CircleMarker
      const outletLat = layer.getLatLng().lat;
      const outletLon = layer.getLatLng().lng;
      getWatershed({
        ensemble_name: this.props.watershedEnsemble,
        area: `POINT (${outletLon} ${outletLat})`,
      })
        .then(validateWatershedData)
        .then((response) => {
          this.addGeometryLayers(
            geoJSONToLeafletLayers(response.data.boundary),
            layer,
          );
        });
    }
    this.addGeometryLayer(layer);
  };
  handleAreaDeleted = (layers) =>
    this.deleteGeometryLayers(
      this.displayWatershedBoundary() ? this.state.geometryLayers : layers,
    );

  handleUploadArea = (geoJSON) => {
    this.addGeometryLayers(geoJSONToLeafletLayers(geoJSON));
  };

  // Handlers for layer opacity

  handleChangeLayerOpacity = (layerType, opacity) =>
    this.setState((prevState) => ({
      layerOpacity: {
        ...prevState.layerOpacity,
        [layerType]: opacity,
      },
    }));

  // Lifecycle event handlers

  shouldComponentUpdate(nextProps, nextState) {
    const propChange = !_.isEqual(nextProps, this.props);
    const stateChange = !_.isEqual(nextState, this.state);
    const b = propChange || stateChange;
    return b;
  }

  render() {
    // TODO: Add positioning for autoset

    const dataLayers = DataMap.layerTypes.map(
      (layerType) =>
        this.props[layerType] && (
          <DataLayer
            key={layerType}
            layerType={layerType}
            layerParams={{
              ...this.props[layerType],
              opacity: this.state.layerOpacity[layerType],
            }}
            onLayerRef={this.handleLayerRefs[layerType]}
          />
        ),
    );

    const allowGeometryDraw = this.state.geometryLayers.length === 0;

    return (
      <CanadaBaseMap mapRef={this.handleMapRef}>
        {dataLayers}

        <LayerOpacityControl
          layerOpacity={this.state.layerOpacity}
          onChange={this.handleChangeLayerOpacity}
        />

        <NcWMSColorbarControl
          layer={this.state.rasterLayer}
          {...this.props.raster} // update when any raster prop changes
        />

        <NcWMSAutosetColorscaleControl
          layers={[this.state.rasterLayer, this.state.isolineLayer]}
        />

        <NcWMSColorbarControl
          layer={this.state.isolineLayer}
          {...this.props.isoline} // update when any isoline prop changes
        />

        {allowGeometryDraw && !this.props.pointSelect && (
          <StaticControl position="topleft">
            <GeoLoader
              onLoadArea={this.handleUploadArea}
              title="Import polygon"
            />
          </StaticControl>
        )}

        <GeomanControl
          map={this.state.map}
          layers={this.state.geometryLayers}
          pointSelect={this.props.pointSelect}
          protectBoundary={Boolean(this.displayWatershedBoundary())}
          shapeStyle={this.props.activeGeometryStyle}
          onCreate={this.handleAreaCreated}
          onEdit={this.onSetArea}
          onRemove={this.handleAreaDeleted}
        />

        {
          // See comments at module head regarding current GeoExporter
          // arrangement.
          !allowGeometryDraw && (
            <StaticControl position="topleft">
              <GeoExporter
                area={this.layersToArea(this.state.geometryLayers)}
                title="Export polygon"
              />
            </StaticControl>
          )
        }

        {this.props.children}
      </CanadaBaseMap>
    );
  }
}

export default DataMap;
