/* eslint-disable no-trailing-spaces */
import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import { Map, TileLayer, WMSTileLayer, FeatureGroup, GeoJSON } from 'react-leaflet';
import 'proj4';
import 'proj4leaflet';
import { EditControl } from 'react-leaflet-draw';

import StaticControl from '../StaticControl';
import './CanadaBaseMap.css';
import utils from '../Map/utils';
import LeafletNcWMSColorbarControl from '../../core/leaflet-ncwms-colorbar';
import LeafletNcWMSAutoscaleControl from '../../core/leaflet-ncwms-autoset-colorscale';


class CanadaBaseMap extends React.Component {
  // Notes:
  // - Do we really want `crs`, `version`, `srs`, `origin` to be props?
  //  These props are not passed in any existing code; only their default
  //  values are used.

  static propTypes = {
    crs: PropTypes.object,
    version: PropTypes.string,
    srs: PropTypes.string,
    origin: PropTypes.object,
    mapRef: PropTypes.func,
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

  render() {
    const center = _.pick(this.props.origin, 'lat', 'lng');
    return (
        <Map
          crs={this.props.crs}
          center={center}
          zoom={this.props.origin.zoom}
          minZoom={0}
          maxZoom={10}
          maxBounds={L.latLngBounds([[40, -150], [90, -50]])}
          ref={this.props.mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url={TILECACHE_URL + '/1.0.0/na_4326_osm/{z}/{x}/{y}.png'}
            subdomains={'abc'}
            noWrap
            maxZoom={12}
          />
          { this.props.children }
        </Map>
    );
  }
}

export default CanadaBaseMap;
