/*
 * Requires global Leaflet variable `L`
 * Compatible with any ncWMS server which fulfills `minmax` and
 * `layerDetails` `GetMetadata` requests.
*/
import axios from 'axios';
import {getVariableOptions, PRECISION} from './util';

var round = function (number, places) {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
};

var ncWMSColorbarControl = L.Control.extend({
  options: {
    position: 'bottomright',
    decimalPlaces: 2,
    width: 20,
    height: 300,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 10,
    opacity: 0.75,
    color: '#424242',
  },

  initialize: function (layer, options) {
    this.layer = layer;
    options.decimalPlaces = this.getDecimalPrecision(layer);

    L.Util.setOptions(this, options);
  },

  onAdd: function () {
    // Container element
    this.container = L.DomUtil.create('div', 'leaflet-control');

    Object.assign(this.container.style, {
      position: 'relative',
      width: this.options.width + 'px',
      height: this.options.height + 'px',
      borderWidth: this.options.borderWidth + 'px',
      borderStyle: this.options.borderStyle,
      borderRadius: this.options.borderRadius + 'px',
      opacity: this.options.opacity,
      color: this.options.color,
      fontWeight: 'bold',
      textShadow: '0 0 0.2em white, 0 0 0.2em white, 0 0 0.2em white',
      whiteSpace: 'nowrap',
    });

    // Set up event handling
    L.DomEvent
      .addListener(this.container, 'click', L.DomEvent.stopPropagation)
      .addListener(this.container, 'click', L.DomEvent.preventDefault);
    this.layer.on('loading', function () {
      this.refreshValues();
    }.bind(this));

    // Create and style labels
    var applyLabelStyle = function (el) {
      el.style.position = 'absolute';
      el.style.right = this.options.width + 'px';
    }.bind(this);

    this.maxContainer = L.DomUtil.create('div', '', this.container);
    applyLabelStyle(this.maxContainer);
    this.maxContainer.style.top = '-0.5em';
    this.maxContainer.innerHTML = 'max';

    this.midContainer = L.DomUtil.create('div', '', this.container);
    applyLabelStyle(this.midContainer);
    this.midContainer.style.top = '50%';
    this.midContainer.innerHTML = 'mid';

    this.minContainer = L.DomUtil.create('div', '', this.container);
    applyLabelStyle(this.minContainer);
    this.minContainer.style.bottom = '-0.5em';
    this.minContainer.innerHTML = 'min';

    this.refreshValues();
    return this.container;
  },

  refreshValues: function () {
    /*
     * Source new values from the ncWMS server. Possible future breakage due to
     * using layer._url and layer._map.
     */

    if (this.layer.wmsParams.colorscalerange) {
      // Use colorscalerange if defined on the layer
      this.min = +this.layer.wmsParams.colorscalerange.split(',')[0];
      this.max = +this.layer.wmsParams.colorscalerange.split(',')[1];
      this.redraw();
    } else {
      // Get layer bounds from `layerDetails`
      var getLayerInfo = axios(this.layer._url, {
        dataType: 'json',
        params: {
          request: 'GetMetadata',
          item: 'layerDetails',
          layerName: this.layer.wmsParams.layers,
          time: this.layer.wmsParams.time,
        },
      });

      var getMinMax = layerInfo => {
        return axios(this.layer._url, {
          params: {
            request: 'GetMetadata',
            item: 'minmax',
            layers: escape(this.layer.wmsParams.layers),
            styles: 'default-scalar',
            version: '1.1.1',
            bbox: layerInfo.data.bbox.join(),
            srs: this.layer.wmsParams.srs,
            crs: this.layer.wmsParams.srs,
            time: this.layer.wmsParams.time,
            elevation: 0,
            width: 100,
            height: 100,
          },
        });
      };

      getLayerInfo.then(getMinMax).then(response => {
        this.min = response.data.min;
        this.max = response.data.max;
        this.redraw();
      });
    }
  },

  getMidpoint: function (mn, mx, logscale) {
    var mid;

    if (logscale === true || logscale === 'true') {
      var logMin = mn <= 0 ? 1 : mn;
      mid = Math.exp(((Math.log(mx) - Math.log(logMin)) / 2) + Math.log(logMin));
    } else {
      mid = (mn + mx) / 2;
    }
    return mid;
  },

  graphicUrl: function () {
    var palette = this.layer.wmsParams.styles.split('/')[1];
    return this.layer._url + '?REQUEST=GetLegendGraphic' +
      '&COLORBARONLY=true' +
      '&WIDTH=1' +
      '&HEIGHT=' + this.options.height +
      '&PALETTE=' + palette +
      '&NUMCOLORBANDS=' + this.layer.wmsParams.numcolorbands;
  },

  //uses the variable defined in the layer and the variable-options.yaml
  //config file to determine decimal precision. Defaults to util.PRECISION
  getDecimalPrecision: function (layer = this.layer) {
    var places = PRECISION;
    var variableName = layer.wmsParams.layers.split("/")[1];

    if (getVariableOptions(variableName, "decimalPrecision") !== undefined) {
      places = getVariableOptions(variableName, "decimalPrecision");
    }
    return places;
  },

  redraw: function () {
    this.container.style.backgroundImage = 'url("' + this.graphicUrl() + '")';
    this.maxContainer.innerHTML = round(this.max, this.getDecimalPrecision());
    this.midContainer.innerHTML = round(this.getMidpoint(this.min, this.max, this.layer.wmsParams.logscale), this.getDecimalPrecision());
    this.minContainer.innerHTML = round(this.min, this.getDecimalPrecision());
  },
});

export default ncWMSColorbarControl;
