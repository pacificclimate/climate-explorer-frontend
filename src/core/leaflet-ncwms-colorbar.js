/*
 * Relies upon global Leaflet variable 'L'
*/

var round = function (number, places) {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
};

var ncWMSColorbarControl = L.Control.extend({
  options: {
    position: 'bottomright',
    decimalPlaces: 2,
  },

  initialize: function (layer, options) {
    this.layer = layer;
    L.Util.setOptions(this, options);
  },

  onAdd: function () {
    // Container element
    this.container = L.DomUtil.create('div', 'leaflet-control');

    Object.assign(this.container.style, {
      position: 'relative',
      width: '20px',
      height: '300px',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '10px',
      opacity: '0.75',
      color: '#424242',
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
      el.style.right = '20px';
    };

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
    Source new values from the ncWMS server.
    Possible future breakage due to using layer._url and layer._map.
    */

    if (this.layer.wmsParams.colorscalerange) {
      // Use colorscalerange if defined on the layer
      this.min = this.layer.wmsParams.colorscalerange.split(',')[0];
      this.max = this.layer.wmsParams.colorscalerange.split(',')[1];
      this.redraw();
    } else {
      // Get layer bounds from `layerDetails`
      var getLayerInfo = $.ajax(this.layer._url, {
        context: this,
        dataType: 'json',
        crossDomain: true,
        data: {
          request: 'GetMetadata',
          item: 'layerDetails',
          layerName: this.layer.wmsParams.layers,
          time: this.layer.wmsParams.time,
        },
      });

      // Use that layerInfo bbox to for minmax request
      var getMinMax = function (layerInfo) {
        return $.ajax(this.layer._url, {
          context: this,
          crossDomain: true,
          data: {
            request: 'GetMetadata',
            item: 'minmax',
            layers: this.layer.wmsParams.layers,
            bbox: layerInfo.bbox.join(),
            time: this.layer.wmsParams.time,
            srs: this.layer.wmsParams.srs,
            width: 100,
            height: 100,
          },
        });
      };

      $.when(getLayerInfo).then(getMinMax).done(function (data) {
        this.min = data.min;
        this.max = data.max;
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
      '&HEIGHT=300' +
      '&PALETTE=' + palette +
      '&NUMCOLORBANDS=254';
  },

  redraw: function () {
    this.container.style.backgroundImage = 'url("' + this.graphicUrl() + '")';
    this.maxContainer.innerHTML = round(this.max, this.options.decimalPlaces);
    this.midContainer.innerHTML = round(this.getMidpoint(this.min, this.max, this.layer.wmsParams.logscale), this.options.decimalPlaces);
    this.minContainer.innerHTML = round(this.min, this.options.decimalPlaces);
  },
});

export default ncWMSColorbarControl;
