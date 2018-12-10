import _ from 'underscore';
import { saveAs } from 'filesaver.js';
import togeojson from 'togeojson';
import { parse, stringify } from 'wellknown';
import _tokml from 'tokml';
import _togpx from 'togpx';
import shp from 'shpjs';
import { write } from 'shp-write';
const geojson = require('shp-write/src/geojson');
const prj = require('shp-write/src/prj');
import JSZip from 'jszip';  // Installed by `shp-write`

function createZippedShapefile(gj, options) {
  // Alternate to function `zip` in `shp-write/src/zip`, but with option to
  // store files in root of zipped shapefile.
  //
  // All behaviour is the same as the original function, with the exception
  // of that related to `options.folder`.
  //
  //  - When undefined, shapefiles are placed in the root folder.
  //    This is different from the original behaviour. There is no
  //    default subfolder name.
  //
  //  - When defined (a string), shapefiles are placed in a subfolder so
  //    named. This is the same as the original behaviour.

  const zip = new JSZip(),
    folder = options && options.folder,
    layers = folder ? zip : zip.folder(folder);

  [geojson.point(gj), geojson.line(gj), geojson.polygon(gj)]
  .forEach(function(l) {
    if (l.geometries.length) {
      write(
        // field definitions
        l.properties,
        // geometry type
        l.type,
        // geometries
        l.geometries,
        function (err, files) {
          const lType = l.type;
          const optType =
            options && options.types && options.types[lType.toLowerCase()];
          const fileName = optType || lType;
          layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
          layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
          layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
          layers.file(fileName + '.prj', prj);
        });
    }
  });

  const generateOptions = { compression: 'STORE' };

  if (!process.browser) {
    generateOptions.type = 'nodebuffer';
  }

  return zip.generate(generateOptions);
}

function saveZippedShapefile(gj, options) {
  // Alternate to function `download` in `shp-write`, but with option to
  // store files in root of zipped shapefile. See `createZippedShapefile`.
  const content = createZippedShapefile(gj, options);
  location.href = 'data:application/zip;base64,' + content;
}

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
    return this.feature ? stringify(this.feature) : undefined;
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
        saveZippedShapefile(this.toFeatureCollection(this.toGeoJSONobj()));
        break;

      default:
        break;

    }
  },

  loadTextFormat: function (file, success) {
    var reader = new FileReader();
    reader.onload = function (evt) {
      success(JSON.parse(evt.target.result));
    };
    reader.readAsText(file);
  },

  loadShapefile: function (file, success) {
    /*
    https://www.npmjs.com/package/shpjs
    */

    var reader = new FileReader();
    reader.onload = function (evt) {
      shp(evt.target.result).then(function (geojson) {
        success(geojson);
      });
    };

    reader.readAsArrayBuffer(file);
  },

  load: function (file, success, fail) {
    /* All load functions must call `success` handler with a GeoJSON feature */
    var ext = file.name.split('.')[1];

    if (_.contains(['geojson', 'json'], ext)) {
      this.loadTextFormat(file, success);
    } else if (ext === 'zip') {
      this.loadShapefile(file, success);
    } else {
      fail();
    }
  },

};


module.exports = g;
