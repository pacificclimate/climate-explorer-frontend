import L from 'leaflet';
import axios from 'axios';


// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/123
const LeafletNcWMSAutosetColorscaleControl = L.Control.extend({
  options: {
    position: 'bottomright',
  },

  initialize: function ({ layers, options }) {
    this.layers = layers;
    L.Util.setOptions(this, options);
  },

  update: function (newProps) {
    this.initialize(newProps);
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
    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/124
    this.layers.forEach(layer => {
      if (layer) {
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
            if (
              layer &&
              layer.wmsParams.layers === response.config.params.layers
            ) {
              layer.setParams({
                colorscalerange: `${response.data.min},${response.data.max}`,
              });
            }
          });
        });
      }
    });
  },
});


export default LeafletNcWMSAutosetColorscaleControl;
