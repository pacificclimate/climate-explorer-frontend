import { saveAs } from 'filesaver.js';
import togeojson from 'togeojson';
import { parse, stringify } from 'wellknown';

var _tokml = require('tokml');
// import tokml as tkml from 'tokml';
var _togpx = require('togpx');
// import togpx as tgpx from 'togpx';

var g = {

  /* feature stored as geojson object */
  feature: undefined,

  geojson: function (s) {
    this.feature = s;
    return this;
  },

  toGeoJSONobj: function () {
    return this.feature;
  },

  toGeoJSONstr: function () {
    return JSON.stringify(this.feature);
  },

  wkt: function (w) {
    this.feature = parse(w);
    return this;
  },

  toWKT: function () {
    return stringify(this.feature);
  },

  kml: function (k) {
    this.feature = togeojson.kml(k);
  },

  toKML: function () {
    return _tokml(this.feature);
  },

  gpx: function (gpx) {
    this.feature = togeojson.gpx(gpx);
  },

  toGPX: function () {
    return _togpx(this.feature);
  },

  save: function (format) {
    switch (format) {
      case 'wkt':
        saveAs(
          new Blob([this.toWKT()], { type: 'text/plain;charset=utf-8' }),
          'feature.wkt'
        );
        break;

      case 'geojson':
        saveAs(
          new Blob([this.toGeoJSONstr()], { type: 'text/plain;charset=utf-8' }),
          'feature.geojson'
        );
        break;

      case 'kml':
        saveAs(
          new Blob([this.toKML()], { type: 'text/plain;charset=utf-8' }),
          'feature.kml'
        );
        break;

      case 'gpx':
        saveAs(
          new Blob([this.toGPX()], { type: 'text/plain;charset=utf-8' }),
          'feature.gpx'
        );
        break;

      default:
        break;

    }
  },
};

module.exports = g;
