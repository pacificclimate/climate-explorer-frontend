/*
 * Relies upon global Leaflet variable 'L'
 * Compatible with any ncWMS server which fulfills the `minmax`
 * `GetMetadata` requests.
*/

var ncWMSAutoscaleControl = L.Control.extend({
  options: {
    position: 'topleft',
  },

  initialize: function (layer, options) {
    this.layer = layer;
    L.Util.setOptions(this, options);
  },

  onAdd: function () {
    // Container element
    this.container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
    this.container.title = 'Autoscale map color scale to current view';
    this.container.style.cursor = 'pointer';

    this.button = L.DomUtil.create('a', '', this.container);
    this.button.innerHTML = 'AS';
    this.button.style.fontWeight = 'bold';

    // Set up event handling
    L.DomEvent
      .addListener(this.container, 'click', L.DomEvent.stopPropagation)
      .addListener(this.container, 'click', L.DomEvent.preventDefault)
      .addListener(this.container, 'click', this.autoscale, this);

    return this.container;
  },

  autoscale: function () {
    /*
    Get min/max for current view then update layer params
    */

    $.ajax(this.layer._url, {
      context: this,
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
      this.layer.setParams({ colorscalerange: data.min + ',' + data.max });
    });
  },
});

export default ncWMSAutoscaleControl;
