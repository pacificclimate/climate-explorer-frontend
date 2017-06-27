//A map that shows two variables: one with isolines and one with colors.

import React from 'react';
import _ from 'underscore';
import leafletImage from 'leaflet-image';
import { saveAs } from 'filesaver.js';

import utils from './utils';
import NcWMSColorbarControl from '../../core/leaflet-ncwms-colorbar';
import NcWMSAutoscaleControl from '../../core/leaflet-ncwms-autoset-colorscale';

import styles from './map.css';

var DualMap = React.createClass({

  propTypes: {
    dataset: React.PropTypes.string,
    variable: React.PropTypes.string,
    crs: React.PropTypes.object,
    // To keep things simple, areas within this component should only be
    // passed around (or up to a higher component) as GeoJSON
    onSetArea: React.PropTypes.func.isRequired,
    area: React.PropTypes.object,
    origin: React.PropTypes.object,
  },

  getInitialState: function () {
    return {
      area: undefined,
    };
  },

  getDefaultProps: function () {
    console.log("getDefaultProps called");
    return {
      crs: new L.Proj.CRS.TMS(
        'EPSG:4326',
        '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
        [-150, -10, -50, 90],
        {
          resolutions: utils.generateResolutions(0.09765625, 10),
        }
      ),
      noWrap: true,
      format: 'image/png',
      transparent: 'true',
      opacity: 0.7,
      styles: 'boxfill/ferret',
      time: '2000-01-01',
      numcolorbands: 254,
      version: '1.1.1',
      srs: 'EPSG:4326',
      logscale: false,
      origin: { lat: 60, lon: -100, zoom: 0 },
    };
  },

  getWMSParams: function () {
    console.log("getWMSParams called");
    alert("shouldn't be calling me.");
    var params = { layers: this.props.dataset + '/' + this.props.variable };
    _.extend(params, _.pick(this.props,
      'noWrap',
      'format',
      'transparent',
      'opacity',
      'styles',
      'time',
      'numcolorbands',
      'version',
      'srs',
      'colorscalerange',
      'logscale'
    ));
    return params;
  },

  //temporary workaround to get ncWMS2 working.
  stubWMSParams: function(props) {
    console.log("stubWMSParams called.");
    console.log("at the time, props is:");
    console.log(props);
    return {
      noWrap: true,
      layers: `${props.dataset}/${props.variable}`,
      format: "image/png",
      transparent: true,
      opacity: 80,
      styles: "default-scalar/seq-GreysRev",
      time: this.props.time,
      numcolorbands:254,
      version: "1.1.1",
      srs: "EPSG:4326",
      logscale: false
    };
  },

  stubWMSParams2: function(props) {
    console.log("stubWMSParams2 called");
    return {
      noWrap: true,
      layers:  `${props.dataset2}/${props.variable2}`,
      format: "image/png",
      transparent: true,
      opacity: 80,
      styles: "colored_contours/psu-magma",
      time: this.props.time,
      numcolorbands:254,
      version: "1.1.1",
      srs: "EPSG:4326",
      logscale: false
    };
  },

  clearMapFeatures: function () {
    console.log("clearMapFeatures called");
    this.drawnItems.getLayers().map(function (layer) {
      this.drawnItems.removeLayer(layer);
    }.bind(this));
  },

  // generally called for a new area originating from within this component
  // propagate the area up the component stack
  handleSetArea: function (geojson) {
    console.log("handleSetArea called");
    this.setState({ area: geojson });
    this.props.onSetArea(geojson);
  },

  // area received from props; don't propagate back up the component stack
  handleNewArea: function (geojson) {
    console.log("handleNewArea called");
    this.setState({ area: geojson });
    this.clearMapFeatures();
        // L.geoJson returns a FeatureGroup. Only add first layer of group.
    this.drawnItems.addLayer(L.geoJson(geojson, {
      stroke: true,
      color: '#f06eaa',
      weight: 4,
      opacity: 0.5,
      fill: true,
      fillOpacity: 0.2,
      clickable: true,
    }).getLayers()[0]);
  },

  componentDidMount: function () {
    console.log("ComponentDidMount called");
    var map = this.map = L.map(this._map, {
      crs: this.props.crs,
      minZoom: 0,
      maxZoom: 10,
      maxBounds: L.latLngBounds([[40, -150], [90, -50]]),
      layers: [
        L.tileLayer(TILECACHE_URL + '/1.0.0/na_4326_osm/{z}/{x}/{y}.png', {
          subdomains: 'abc',
          noWrap: true,
          maxZoom: 10,
          attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
    });

    //this.ncwmsLayer = L.tileLayer.wms(NCWMS_URL, this.stubWMSParams()).addTo(map);
    this.ncwmsLayer=L.tileLayer.wms("http://localhost:8080/ncwms228/wms", this.stubWMSParams(this.props)).addTo(map);
    this.ncwmsLayer2=L.tileLayer.wms("http://localhost:8080/ncwms228/wms", this.stubWMSParams2(this.props)).addTo(map);
    map.setView(L.latLng(this.props.origin.lat, this.props.origin.lon), this.props.origin.zoom);

    /*
    Draw controls
    */

    var drawnItems = this.drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawOptions = {
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        marker: false,
        circle: false,
        polyline: false,
      },
    };
    var drawControl = new L.Control.Draw(drawOptions);
    map.addControl(drawControl);

    var onDraw = function (e) {
      var layer = e.layer;

      this.clearMapFeatures();
      this.drawnItems.addLayer(layer);

      /*
      Adding a property is required to create a proper dbf file when saving
      as a shapefile. Without it, QGIS and ARC can load the shapefile,
      but shpjs cannot convert back to geojson
      */
      var gj = layer.toGeoJSON();
      gj.properties.source = 'PCIC Climate Explorer';
      this.handleSetArea(gj);
    }.bind(this);

    var onEdit = function (e) {
      console.log("onEdit called");
      var layers = e.layers.getLayers();
      if (layers.length !== 1) {
        // Should never happen
        // TODO: use a better popup (bind handleAlert at top level?)
        alert('Something went wrong editing the feature');
        return;
      }
      this.handleSetArea(layers[0].toGeoJSON());
    }.bind(this);

    var onDelete = function (e) {
      console.lot("onDelet called");
      var layers = e.layers.getLayers();
      if (layers.length !== 1) {
        // Should never happen
        // TODO: use a better popup (bind handleAlert at top level?)
        alert('Something went wrong deleting this feature');
        return;
      }
      this.handleSetArea(undefined);
    }.bind(this);

    map.on('draw:created', onDraw);
    map.on('draw:edited', onEdit);
    map.on('draw:deleted', onDelete);

    /*
    Print controls
    */

    var doImage = function (err, canvas) {
      console.log("doImage called");
      console.log(err);
      var dataURL = canvas.toDataURL('image/png');

      var data = atob(dataURL.substring('data:image/png;base64,'.length));
      var asArray = new Uint8Array(data.length);

      for (var i = 0, len = data.length; i < len; ++i) {
        asArray[i] = data.charCodeAt(i);
      }
      var blob = new Blob([asArray.buffer], { type: 'image/png' });
      saveAs(blob, 'map.png');
    };

    var initPrintControl = function () {
      console.log("initPrintControl called");
      this.container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      this.container.title = 'Download map image';
      L.DomEvent
        .addListener(this.container, 'click', L.DomEvent.stopPropagation)
        .addListener(this.container, 'click', L.DomEvent.preventDefault);
      this.button = L.DomUtil.create('a', styles.leafletControlImage, this.container);

      L.DomEvent.addListener(this.container, 'click', function () {
        leafletImage(map, doImage);
      });

      return this.container;
    };

    var PrintControl = L.Control.extend({
      options: {
        position: 'topleft',
      },
      onAdd: initPrintControl,
    });

    map.addControl(new PrintControl());

    map.addControl(new NcWMSColorbarControl(this.ncwmsLayer));
    map.addControl(new NcWMSAutoscaleControl(this.ncwmsLayer, {
      position: 'bottomright',
    }));
  },

  componentWillUnmount: function () {
    console.log("componentWillUnmount called");
    this.map.off('click', this.onMapClick);
    this.map = null;
  },
  onMapClick: function () {
    console.log('clicked on map');
  },
  componentWillReceiveProps: function (newProps) {
    console.log("componentWillReceiveProps called.");
    console.log("newProps = ");
    console.log(newProps);

    var params = { layers: newProps.dataset + '/' + newProps.variable };
    _.extend(params, _.pick(newProps, 'logscale', 'styles', 'time'));


    // FIXME: This isn't ideal. Leaflet doesn't support /removing/
    // wmsParameters yet - https://github.com/Leaflet/Leaflet/issues/3441
    delete(this.ncwmsLayer.wmsParams.colorscalerange);

    //this.ncwmsLayer.setParams(params);
    this.ncwmsLayer.setParams(this.stubWMSParams(newProps));
    this.ncwmsLayer2.setParams(this.stubWMSParams2(newProps));
    if (this.state.area !== newProps.area) {
      this.handleNewArea(newProps.area);
    }
  },
  render: function () {
    console.log("Render called");
    return (
      <div className={styles.map}>
        <div ref={ (c) => this._map = c } className={styles.map} />
      </div>
    );
  },
});

module.exports.DualMap = DualMap;