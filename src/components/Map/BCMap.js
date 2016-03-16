var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('./utils');

var styles = {
  map: {
    width: '100%',
    height: '100%',
  },
};

var BCMap = React.createClass({
  componentDidMount: function () {
    var crs = new L.Proj.CRS.TMS(
      'EPSG:3005',
      '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
      [-1000000, -1000000, 3000000, 3000000],
      {
        resolutions: utils.generateResolutions(7812.5, 12),
      }
    );

    var map = L.map(ReactDOM.findDOMNode(this), {
      crs: crs,
      minZoom: 0,
      maxZoom: 12,
      maxBounds: L.latLngBounds([[45, -148], [62, -108]]),
      layers: [
        L.tileLayer(TILECACHE_URL + '1.0.0/bc_osm/{z}/{x}/{y}.png',
          {
            subdomains: 'abc',
            noWrap: true,
            maxZoom: 12,
            attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }),
      ],
    });

    map.on('click', this.onMapClick);
    map.setView(L.latLng(55, -125), 2);
  },

  componentWillUnmount: function () {
    this.map.off('click', this.onMapClick);
    this.map = null;
  },
  onMapClick: function () {
    // console.log('clicked on map');
  },
  render: function () {
    return (
            <div style={styles.map}></div>
        );
  },
});

module.exports.BCMap = BCMap;
