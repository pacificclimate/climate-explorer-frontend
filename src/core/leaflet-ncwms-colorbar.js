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
    this.container.style.position = 'relative';
    this.container.style.width = '20px';
    this.container.style.height = '300px';
    this.container.style.borderWidth = '2px';
    this.container.style.borderStyle = 'solid';
    this.container.style.borderRadius = '10px';
    this.container.style.opacity = '0.75';
    this.container.style.color = '#424242';
    this.container.style.fontWeight = 'bold';
    this.container.style.textShadow = '0 0 0.2em white, 0 0 0.2em white, 0 0 0.2em white';
    this.container.style.whiteSpace = 'nowrap';

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
    $.ajax(this.layer._url, {
      crossDomain: true,
      data: {
        request: 'GetMetadata',
        item: 'minmax',
        layers: this.layer.wmsParams.layers,
        bbox: this.layer._map.getBounds().toBBoxString(),
        time: this.layer.wmsParams.time,
        srs: this.layer.wmsParams.srs,
        width: 100,
        height: 100,
      },
    }).done(function (data) {
      this.min = data.min;
      this.max = data.max;
      this.redraw();
    }.bind(this));
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
