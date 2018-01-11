import PropTypes from 'prop-types';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import g from '../../core/geo';

var exportPolygon = function (area, format) {
  this.close();
  g.geojson(area).save(format);
};

var GeoExporterDropdown = React.createClass({

  propTypes: {
    area: PropTypes.object,
  },

  render() {
    var boundExport = function (e, key) {
      exportPolygon(this.props.area, key);
    }.bind(this);

    return (
      <DropdownButton title={'Export Polygon'} onSelect={boundExport}>
        <MenuItem eventKey='shp'>Shapefile</MenuItem>
        <MenuItem eventKey='geojson'>GeoJSON</MenuItem>
        <MenuItem eventKey='wkt'>WKT</MenuItem>
        <MenuItem eventKey='kml'>KML</MenuItem>
        <MenuItem eventKey='gpx'>GPX</MenuItem>
      </DropdownButton>
    );
  },

});

export default GeoExporterDropdown;