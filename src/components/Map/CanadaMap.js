var React = require("react");

var utils = require("./utils");

import './map.css';

var CanadaMap = React.createClass({
    componentDidMount: function() {
        var crs = new L.Proj.CRS.TMS(
            'EPSG:4326',
            '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
            [-150, -10, -50, 90],
            {
                resolutions: utils.generate_resolutions(0.09765625, 10)
            }
        );

        var map = this.map = L.map(this.getDOMNode(), {
            crs: crs,
            minZoom: 0,
            maxZoom: 10,
            maxBounds: L.latLngBounds([[40, -150], [90, -50]]),
            layers: [
                L.tileLayer(
                'http://{s}.tiles.pacificclimate.org/tilecache/tilecache.py/1.0.0/na_4326_osm/{z}/{x}/{y}.png',
                {
                    subdomains: 'abc',
                    noWrap: true,
                    maxZoom: 10,
                    attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                })
            ]
        });

        map.on('click', this.onMapClick);
        map.setView(L.latLng(60, -100), 1);

    },
    componentWillUnmount: function() {
        this.map.off('click', this.onMapClick);
        this.map = null;
    },
    onMapClick: function() {
        console.log('clicked on map');
    },
    render: function() {
        return (
            <div className="map"></div>
        );
    }
});

module.exports.CanadaMap = CanadaMap;
