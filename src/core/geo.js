import { saveAs } from 'filesaver.js';
import togeojson from 'togeojson';
import { parse, stringify } from 'wellknown';
import _tokml from 'tokml';
import _togpx from 'togpx';

import { download } from 'shp-write';

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

  toFeatureCollection: function () {
    return {
      type: 'FeatureCollection',
      features: [this.feature],
    };
  },

  // shp: function (f) {
  //   // TODO
  //   return;
  // },

  // toShp: function () {

  // },

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

      case 'shp':
        download(this.toFeatureCollection(this.toGeoJSONobj()));
        break;

      default:
        break;

    }
  },
  load: function(file, success) {
    var ext = file.name.split('.')[1]
    var reader = new FileReader();
    reader.onload = function(evt) {
      console.log(evt.target.result);
      success(JSON.parse(evt.target.result));
    };
    reader.readAsText(file);
  },
};

module.exports = g;
