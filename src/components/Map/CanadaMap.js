var React = require("react");
var ReactDOM = require("react-dom");
var _ = require('underscore');

var utils = require("./utils");

import styles from './map.css';

var CanadaMap = React.createClass({

    propTypes: {
        dataset: React.PropTypes.string,
        variable: React.PropTypes.string,
        // To keep things simple, areas within this component should only be
        // passed around (or up to a higher component) as GeoJSON
        onSetArea: React.PropTypes.func.isRequired,
        area: React.PropTypes.object,
    },

    getInitialState: function () {
        return {
            area: undefined
        }
    },

    getDefaultProps: function() {
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
            format: "image/png",
            transparent: "true",
            opacity: 0.7,
            styles: "boxfill/ferret",
            time: "2000-01-01",
            numcolorbands: 254,
            version: "1.1.1",
            srs: "EPSG:4326",
            logscale: false
        };
    },
    getWMSParams: function() {
        var params = {layers: this.props.dataset + "/" + this.props.variable};
        _.extend(params, _.pick(this.props, 'noWrap', 'format', 'transparent', 'opacity', 'styles', 'time', 'numcolorbands', 'version', 'srs', 'colorscalerange', 'logscale'));
        return params;
    },
    clearMapFeatures: function() {
        this.drawnItems.getLayers().map(function (layer) {
            this.drawnItems.removeLayer(layer);
        }.bind(this));
    },
    // generally called for a new area originating from within this component
    // propagate the area up the component stack
    handleSetArea: function(geojson) {
        this.setState({area: geojson})
        this.props.onSetArea(geojson);
    },
    // area received from props; don't propagate back up the component stack
    handleNewArea: function(geojson) {
        this.setState({area: geojson});
        this.clearMapFeatures();
        // L.geoJson returns a FeatureGroup. Only add first layer of group.
        this.drawnItems.addLayer(L.geoJson(geojson, {
            stroke: true,
            color: '#f06eaa',
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillOpacity: 0.2,
            clickable: true
        }).getLayers()[0]);
    },
    componentDidMount: function() {
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

        var datalayerName = "Climate raster";
        var ncwmsLayer =  this.ncwmsLayer = new L.tileLayer.wms(NCWMS_URL, this.getWMSParams()).addTo(map);

        var drawnItems = this.drawnItems = new L.FeatureGroup();
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
        }
        var drawControl = new L.Control.Draw(drawOptions);
        map.addControl(drawControl);

        var onDraw = function(e) {
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

        var onEdit = function(e) {
            var layers = e.layers.getLayers();
            if (layers.length != 1) { //Should never happen
                // TODO: use a better popup (bind handleAlert at top level?)
                alert("Something went wrong editing the feature");
                return;
            }
            this.handleSetArea(layers[0].toGeoJSON());
        }.bind(this);

        var onDelete = function(e) {
            var layers = e.layers.getLayers();
            if (layers.length != 1) { //Should never happen
                // TODO: use a better popup (bind handleAlert at top level?)
                alert("Something went wrong deleting this feature");
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
    componentWillUnmount: function() {
        this.map.off('click', this.onMapClick);
        this.map = null;
    },
    onMapClick: function() {
        console.log('clicked on map');
    },
    componentWillReceiveProps: function(newProps) {
        var params = {layers: newProps.dataset + "/" + newProps.variable};
        _.extend(params, _.pick(newProps, 'logscale', 'styles', 'time'));
        this.ncwmsLayer.setParams(params);
	if (this.state.area !== newProps.area) {
            this.handleNewArea(newProps.area);
	}
    },
    render: function() {
        return (
            <div className={styles.map}>
		<div ref={ (c) => this._map = c } className={styles.map} />
		{ this.props.children }
	    </div>
        );
    }
});

module.exports.CanadaMap = CanadaMap;
