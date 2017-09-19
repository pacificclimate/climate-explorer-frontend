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
    //this.layer = layer;
    this.layers = [];
    this.layers.push(layer);
    L.Util.setOptions(this, options);
  },

  addLayer: function (layer) {
    this.layers[this.layers.length] = layer;
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
    this.layers.forEach(layer => {
      axios(layer._url, {
        params: {
          request: 'GetMetadata',
          item: 'minmax',
          layers: layer.wmsParams.layers,
          styles: 'default-scalar',
          version: '1.1.1',
          bbox: layer._map.getBounds().toBBoxString(),
          srs: layer.wmsParams.srs,
          crs: layer.wmsParams.srs,
          time: layer.wmsParams.time,
          elevation: 0,
          width: 100,
          height: 100,
        },
      }).then(response => {
        this.layers.forEach(layer => {
          if(layer.wmsParams.layers == response.config.params.layers) {
            layer.setParams({ colorscalerange: response.data.min + ',' + response.data.max });
          }
        });
      });
    });
  },
});

export default ncWMSAutoscaleControl;
