var React = require("react");
var ReactDOM = require("react-dom");

var utils = require("./utils");

import styles from './map.css';

var CanadaMap = React.createClass({

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
            //opacity: 0.7,
            styles: "boxfill/ferret",
            time: "2000-01-01",
            numcolorbands: 254,
            version: "1.1.1",
            srs: "EPSG:4326",
            colorscalerange: "-50,11.0",
            logscale: false
        };
    },
    getWMSParams: function() {
        var params = {layers: this.props.dataset + "/" + this.props.variable};
        $.extend(params, this.props);
        return params;
    },
    componentDidMount: function() {
        var map = this.map = L.map(ReactDOM.findDOMNode(this), {
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
    componentDidUpdate: function() {
        this.ncwmsLayer.setParams(this.getWMSParams());
    },
    render: function() {
        return (
            <div className={styles.map}></div>
        );
    }
});

module.exports.CanadaMap = CanadaMap;
