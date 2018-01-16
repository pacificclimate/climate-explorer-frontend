/* eslint-disable no-trailing-spaces */
import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import { Map, TileLayer, WMSTileLayer, FeatureGroup, GeoJSON } from 'react-leaflet';
import 'proj4';
import 'proj4leaflet';
import { EditControl } from 'react-leaflet-draw';

import StaticControl from '../StaticControl';
import './TestMap.css';
import utils from '../Map/utils';
import LeafletNcWMSColorbarControl from '../../core/leaflet-ncwms-colorbar';
import LeafletNcWMSAutoscaleControl from '../../core/leaflet-ncwms-autoset-colorscale';


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


class TestMap extends React.Component {
  // Notes:
  // - Do we really want `crs`, `version`, `srs`, `origin` to be props? These props are not passed in any existing
  //    code; only their default values are used.
  // - `area` is a prop and should not be stored as state in this component. This is basic React good practice, and
  //    it also simplifies the code enormously.
  //

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
    origin: PropTypes.object,
  };

  static defaultProps = {
    crs: new L.Proj.CRS(
      'EPSG:4326',
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
      {
        resolutions: utils.generateResolutions(0.09765625, 10),
        // If we don't set the origin correctly, then the projection transforms BC Albers coordinates to lat-lng
        // coordinates incorrectly. You have to know the magic origin value.
        //
        // It is also probably important to know that the bc_osm tile set is a TMS tile set, which has axes
        // transposed with respect to Leaflet axes. The proj4leaflet documentation incorrectly states that
        // there is a CRS constructor `L.Proj.CRS.TMS` for TMS tilesets. It is absent in the version
        // (1.0.2) we are using. It exists in proj4leaflet ver 0.7.1 (formerly in use here), and shows that the
        // correct value for the origin option is `[bounds[0], bounds[3]]`, where `bounds` is the 3rd argument
        // of the TMS constructor.
        origin: [-150, 90],
      }
    ),
    version: '1.1.1',
    srs: 'EPSG:4326',
    origin: { lat: 60, lng: -100, zoom: 0 },
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
      if(props.rasterLogscale=="true" && false && !_.isUndefined(this.layerRange.raster)) {
        //clip the dataset to > 0, values of 0 or less do not have a
        //non-complex logarithm
        params.logscale = props.rasterLogscale;
        var min = Math.max(this.layerRange.raster.min, Number.EPSILON);
        var max = Math.max(this.layerRange.raster.max, Number.EPSILON * 2);
        params.colorscalerange = `${min},${max}`;
        params.abovemaxcolor="transparent";
        params.belowmincolor="transparent";
      }
    }
    else if (layer == "isoline") {
      params.styles = `colored_contours/${props.isolinePalette}`;
      params.numContours = props.numberOfContours;
      params.opacity = 1;
      if(props.isolineLogscale=="true" && !_.isUndefined(this.layerRange.isoline)) {
        //clip the dataset to > 0
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

  handleMapRef = makeHandleLeafletRef('map', (map) => {
    console.log('handleMapRef', map);
    // Set up the promises for the raster and isoline layers.
    // Each promise is resolved with either the layer or null if the layer is not created (according to props).
    const rasterLayerPromise = new Promise((resolve) => {
      // This will be called later by the ref callback for the raster layer.
      this.rasterLayerResolve = resolve;
    });
    this.layersPromise = Promise.all([rasterLayerPromise]).then(this.handleLayers);
  }).bind(this);

  handleNcwmsRasterLayerRef = makeHandleLeafletRef('ncwmsRasterLayer', (layer) => {
    console.log('handleNcwmsRasterLayerRef', layer);
    this.rasterLayerResolve(layer);
  }).bind(this);

  handleLayers = ([rasterLayer]) => {
    // When the raster layer (a.k.a "colour blocks") has been added, create and add the
    // raster colour bar control and the autoscale control.
    const rasterBar = new LeafletNcWMSColorbarControl(rasterLayer, { position: 'bottomright' });
    const autoscale = new LeafletNcWMSAutoscaleControl(rasterLayer, { position: 'bottomright' });
    // This relies on this.map being defined at the time this handler is called. That is guaranteed(?) by the
    // fact that the raster layer component (a WMSTileLayer) is rendered inside the Map component.
    this.map.addControl(rasterBar);
    this.map.addControl(autoscale);
  };

  makeRasterLayer() {
    if (this.props.rasterDataset) {
      return (
        <WMSTileLayer
          url={NCWMS_URL}
          {...this.getWMSParams('raster')}
          ref={this.handleNcwmsRasterLayerRef}
        />
      );
    }
    this.rasterLayerResolve(undefined);
  }

  handleAreaCreatedOrEdited = (e) => {
    const area = e.layer.toGeoJSON();
    area.properties.source = 'PCIC Climate Explorer';
    this.props.onSetArea(area);
  };

  handleAreaDeleted = (e) => {
    this.props.onSetArea(undefined);
  };

  render() {
    const center = _.pick(this.props.origin, 'lat', 'lng');
    return (
        <div style={{width: 800, height: 600}}>
          <Map
            crs={this.props.crs}
            center={center}
            zoom={this.props.origin.zoom}
            minZoom={0}
            maxZoom={10}
            maxBounds={L.latLngBounds([[40, -150], [90, -50]])}
            ref={this.handleMapRef}
          >
            <StaticControl position={'topright'}>React Leaflet</StaticControl>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url={TILECACHE_URL + '/1.0.0/na_4326_osm/{z}/{x}/{y}.png'}
              subdomains={'abc'}
              noWrap={true}
              maxZoom={12}
            />
            { this.makeRasterLayer() }
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
          </Map>
      </div>
    );
  }
}

export default TestMap;
