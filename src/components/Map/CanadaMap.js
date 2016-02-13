var React = require('react');
var ReactDOM = require('react-dom');
var GeoJSONToWKT = require('wellknown').stringify;
var _ = require('underscore');

var utils = require('./utils');

import styles from './map.css';

var CanadaMap = React.createClass({

  propTypes: {
    dataset: React.PropTypes.string,
    variable: React.PropTypes.string,
    onSetArea: React.PropTypes.func.isRequired,
  },

  getInitialState: function () {
    return {
      area: undefined
    };
  },

  getDefaultProps: function () {
    return {
      crs: new L.Proj.CRS.TMS(
                'EPSG:4326',
                '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
                [-150, -10, -50, 90],
        {
          resolutions: utils.generate_resolutions(0.09765625, 10)
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
      logscale: false
    };
  },
  getWMSParams: function () {
    var params = { layers: this.props.dataset + '/' + this.props.variable };
    _.extend(params, _.pick(this.props, 'noWrap', 'format', 'transparent', 'opacity', 'styles', 'time', 'numcolorbands', 'version', 'srs', 'colorscalerange', 'logscale'));
    return params;
  },
  handleSetArea: function (wkt) {
    this.setState({ area: wkt });
    this.props.onSetArea(wkt);
  },
  componentDidMount: function () {
    var map = this.map = L.map(this._map, {
      crs: this.props.crs,
      minZoom: 0,
      maxZoom: 10,
      maxBounds: L.latLngBounds([[40, -150], [90, -50]]),
      layers: [
        L.tileLayer(TILECACHE_URL + '/1.0.0/na_4326_osm/{z}/{x}/{y}.png',
            {
              subdomains: 'abc',
              noWrap: true,
              maxZoom: 10,
              attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            })
      ]
    });

    var datalayerName = 'Climate raster';
        // FIXME - Problem: ncWMS layer 404s if we don't provide a dataset/variable. Solution: conditionally add layer to map
    var ncwmsLayer = this.ncwmsLayer = new L.tileLayer.wms(NCWMS_URL, this.getWMSParams()).addTo(map);

    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawOptions = {
      edit: {
        featureGroup: drawnItems
      },
      draw: {
        marker: false,
        circle: false,
        polyline: false
      },
    };
    var drawControl = new L.Control.Draw(drawOptions);
    map.addControl(drawControl);

    var onDraw = function (e) {
      var layer = e.layer;

      drawnItems.getLayers().map((layer) => drawnItems.removeLayer(layer));
      drawnItems.addLayer(layer);
      this.handleSetArea(GeoJSONToWKT(layer.toGeoJSON()));
    }.bind(this);

    var onEdit = function (e) {
      var layers = e.layers.getLayers();
      if (layers.length != 1) { // Should never happen
                // TODO: use a better popup (bind handleAlert at top level?)
        alert('Something went wrong editing the feature');
        return;
      }
      this.handleSetArea(GeoJSONToWKT(layers[0].toGeoJSON()));
    }.bind(this);

    var onDelete = function (e) {
      var layers = e.layers.getLayers();
      if (layers.length != 1) { // Should never happen
                // TODO: use a better popup (bind handleAlert at top level?)
        alert('Something went wrong deleting this feature');
        return;
      }
      this.handleSetArea(undefined);
    }.bind(this);

    map.on('draw:created', onDraw);
    map.on('draw:edited', onEdit);
    map.on('draw:deleted', onDelete);

    map.on('click', this.onMapClick);
    map.setView(L.latLng(60, -100), 0);

  },
  componentWillUnmount: function () {
    this.map.off('click', this.onMapClick);
    this.map = null;
  },
  onMapClick: function () {
    console.log('clicked on map');
  },
  componentWillReceiveProps: function (newProps) {
    var params = { layers: newProps.dataset + '/' + newProps.variable };
    _.extend(params, _.pick(newProps, 'logscale', 'styles', 'time'));
    this.ncwmsLayer.setParams(params);
  },
  render: function () {
    return (
            <div className={styles.map}>
		<div ref={ (c) => this._map = c } className={styles.map} />
		{ this.props.children }
	        </div>
        );
  }
});

module.exports.CanadaMap = CanadaMap;
