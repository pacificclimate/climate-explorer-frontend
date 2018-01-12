var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('./utils');

var styles = {
  map: {
    width: '100%',
    height: '100%',
  },
};

class BCMap extends React.Component {
  componentDidMount() {
    var crs = new L.Proj.CRS(
      'EPSG:3005',
      '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
      {
        resolutions: utils.generateResolutions(7812.5, 12),
        // If we don't set the origin correctly, then the projection transforms BC Albers coordinates to lat-lng
        // coordinates incorrectly. You have to know the magic origin value.
        //
        // It is also probably important to know that the bc_osm tile set is a TMS tile set, which has axes
        // transposed with respect to Leaflet axes. The proj4leaflet documentation incorrectly states that
        // there is a CRS constructor `L.Proj.CRS.TMS` for TMS tilesets. It is absent in the version
        // (1.0.2) we are using. It exists in proj4leaflet ver 0.7.1 (formerly in use here), and shows that the
        // correct value for the origin option is `[bounds[0], bounds[3]]`, where `bounds` is the 3rd argument
        // of the TMS constructor.
        origin: [-1000000, 3000000],
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
  }

  componentWillUnmount() {
    this.map.off('click', this.onMapClick);
    this.map = null;
  }

  onMapClick = () => {
    // console.log('clicked on map');
  };

  render() {
    return (
            <div style={styles.map}></div>
        );
  }
}

module.exports.BCMap = BCMap;
