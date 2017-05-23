/*
 * Relies upon global Leaflet variable 'L'
 * Compatible with any ncWMS server which fulfills the `minmax`
 * `GetMetadata` requests.
*/
import axios from 'axios';

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
     * Get min/max for current view then update layer params
     */
    
    axios(this.layer._url, {
      params: {
        request: 'GetMetadata',
        item: 'minmax',
        layers: this.layer.wmsParams.layers,
        bbox: this.layer._map.getBounds().toBBoxString(),
        time: this.layer.wmsParams.time,
        srs: this.layer.wmsParams.srs,
        width: 100,
        height: 100,
      },
    }).then(function (response) {
      this.layer.setParams({ colorscalerange: response.data.min + ',' + response.data.max });
    }.bind(this));
  },
});

export default ncWMSAutoscaleControl;
