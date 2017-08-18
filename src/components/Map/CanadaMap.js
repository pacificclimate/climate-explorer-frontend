/***************************************************************
 * CanadaMap.js - display component using ncWMS and Leaflet.
 * Will display up to two map layers, one as shaded color blocks, 
 * and one as isolines, or either independently, over a tiled 
 * background. Origin and bounds display all of Canada.
 * 
 * Child of (and viewer for) MapController.
 * 
 * Props passed to configure shaded color map:
 *  - scalarPalette (name of an ncWMS color palette)
 *  - scalarLogscale (true for logarithmic color scale)
 *  - scalarDataset (name of the netCDF datafile)
 *  - scalarVariable (name of the variable)
 *  
 * All the same props are passed to configure isolines, 
 * prefixed "contour", plus an additional prop to describe 
 * the isoline layer: numberOfContours.
 * 
 * other props: time (selects a time slice), 
 *              area (configures an area to highlight).
 * 
 *****************************************************************/

import React from 'react';
import _ from 'underscore';
import leafletImage from 'leaflet-image';
import { saveAs } from 'filesaver.js';

import utils from './utils';
import NcWMSColorbarControl from '../../core/leaflet-ncwms-colorbar';
import NcWMSAutoscaleControl from '../../core/leaflet-ncwms-autoset-colorscale';

import styles from './map.css';

var CanadaMap = React.createClass({

  propTypes: {
    scalarPalette: React.PropTypes.string,
    scalarLogscale: React.PropTypes.bool,
    contourPalette: React.PropTypes.string,
    numberOfContours: React.PropTypes.number,
    contourLogscale: React.PropTypes.bool,
    scalarDataset: React.PropTypes.string,
    contourDataset: React.PropTypes.string,
    scalarVariable: React.PropTypes.string,
    contourVariable: React.PropTypes.string,    
    onSetArea: React.PropTypes.func.isRequired,
    area: React.PropTypes.object,
    origin: React.PropTypes.object,
  },

  getInitialState: function () {
    return {
      area: undefined,
    };
  },

  //generates initial (and unchanging) map settings - origin, projection, etc. 
  getDefaultProps: function () {
    return {
      crs: new L.Proj.CRS.TMS(
        'EPSG:4326',
        '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
        [-150, -10, -50, 90],
        {
          resolutions: utils.generateResolutions(0.09765625, 10),
        }
      ),
      version: '1.1.1',
      srs: 'EPSG:4326',
      origin: { lat: 60, lon: -100, zoom: 0 },
    };
  },
  
  //get map formatting parameters for the scalar or contour layers.
  getWMSParams: function (layer, props = this.props) {
    var params = {
        noWrap: true,
        format: "image/png",
        transparent: true,
        opacity: 80,
        time: props.time,
        numcolorbands: 249,
        version: "1.1.1",
        srs: "EPSG:4326",
    };
    if(layer == "scalar") {
      params.layers = `${props.scalarDataset}/${props.scalarVariable}`;
      params.styles = `default-scalar/${props.scalarPalette}`;
      params.logscale = props.scalarLogscale;
    }
    else if (layer == "contour") {
      params.layers = `${props.contourDataset}/${props.contourVariable}`;
      params.styles = `colored_contours/${props.contourPalette}`;
      params.logscale = props.contourLogscale;
      params.numContours = props.numberOfContours;
    }
    return params;    
  },
  
  
  clearMapFeatures: function () {
    this.drawnItems.getLayers().map(function (layer) {
      this.drawnItems.removeLayer(layer);
    }.bind(this));
  },

  // generally called for a new area originating from within this component
  // propagate the area up the component stack
  handleSetArea: function (geojson) {
    this.setState({ area: geojson });
    this.props.onSetArea(geojson);
  },

  // area received from props; don't propagate back up the component stack
  handleNewArea: function (geojson) {
    this.setState({ area: geojson });
    this.clearMapFeatures();
        // L.geoJson returns a FeatureGroup. Only add first layer of group.
    this.drawnItems.addLayer(L.geoJson(geojson, {
      stroke: true,
      color: '#f06eaa',
      weight: 4,
      opacity: 0.5,
      fill: true,
      fillOpacity: 0.2,
      clickable: true,
    }).getLayers()[0]);
  },

  //initializes the map, loads data, and generates controls
  //NOTE: the buttons that open the "Map Settings" menu are
  //actually provided by MapController, *not* this component.
  //CanadaMap draws colourbars, the autoscale button, and the
  //area drawing and manipulation controls.
  componentDidMount: function () {

    var map = this.map = L.map(this._map, {
      crs: this.props.crs,
      minZoom: 0,
      maxZoom: 10,
      maxBounds: L.latLngBounds([[40, -150], [90, -50]]),
      layers: [
        L.tileLayer(TILECACHE_URL + '/1.0.0/na_4326_osm/{z}/{x}/{y}.png', {
          subdomains: 'abc',
          noWrap: true,
          maxZoom: 10,
          attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
    });

    if(this.props.scalarDataset) {
      this.ncwmsScalarLayer=L.tileLayer.wms(NCWMS_URL, this.getWMSParams("scalar")).addTo(map);
    }
    if(this.props.contourDataset) {
      this.ncwmsContourLayer=L.tileLayer.wms(NCWMS_URL, this.getWMSParams("contour")).addTo(map);
    }
    
    map.setView(L.latLng(this.props.origin.lat, this.props.origin.lon), this.props.origin.zoom);

    /*
    Draw controls
    */

    var drawnItems = this.drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawOptions = {
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        marker: false,
        circle: false,
        polyline: false,
      },
    };
    var drawControl = new L.Control.Draw(drawOptions);
    map.addControl(drawControl);

    var onDraw = function (e) {
      var layer = e.layer;

      this.clearMapFeatures();
      this.drawnItems.addLayer(layer);

      /*
      Adding a property is required to create a proper dbf file when saving
      as a shapefile. Without it, QGIS and ARC can load the shapefile,
      but shpjs cannot convert back to geojson
      */
      var gj = layer.toGeoJSON();
      gj.properties.source = 'PCIC Climate Explorer';
      this.handleSetArea(gj);
    }.bind(this);

    var onEdit = function (e) {
      var layers = e.layers.getLayers();
      if (layers.length !== 1) {
        // Should never happen
        // TODO: use a better popup (bind handleAlert at top level?)
        alert('Something went wrong editing the feature');
        return;
      }
      this.handleSetArea(layers[0].toGeoJSON());
    }.bind(this);

    var onDelete = function (e) {
      var layers = e.layers.getLayers();
      if (layers.length !== 1) {
        // Should never happen
        // TODO: use a better popup (bind handleAlert at top level?)
        alert('Something went wrong deleting this feature');
        return;
      }
      this.handleSetArea(undefined);
    }.bind(this);

    map.on('draw:created', onDraw);
    map.on('draw:edited', onEdit);
    map.on('draw:deleted', onDelete);

    /*
    Print controls
    */

    var doImage = function (err, canvas) {
      console.log(err);
      var dataURL = canvas.toDataURL('image/png');

      var data = atob(dataURL.substring('data:image/png;base64,'.length));
      var asArray = new Uint8Array(data.length);

      for (var i = 0, len = data.length; i < len; ++i) {
        asArray[i] = data.charCodeAt(i);
      }
      var blob = new Blob([asArray.buffer], { type: 'image/png' });
      saveAs(blob, 'map.png');
    };

    var initPrintControl = function () {
      this.container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      this.container.title = 'Download map image';
      L.DomEvent
        .addListener(this.container, 'click', L.DomEvent.stopPropagation)
        .addListener(this.container, 'click', L.DomEvent.preventDefault);
      this.button = L.DomUtil.create('a', styles.leafletControlImage, this.container);

      L.DomEvent.addListener(this.container, 'click', function () {
        leafletImage(map, doImage);
      });

      return this.container;
    };

    var PrintControl = L.Control.extend({
      options: {
        position: 'topleft',
      },
      onAdd: initPrintControl,
    });

    map.addControl(new PrintControl());
    
    var autoscale;
    //add colour legends and autoscale to the map
    //if multiple colour legends are required (two layers), the
    //autoscale button goes between them to indicate it affects 
    //both layers
    if(this.props.contourDataset && this.props.scalarDataset) {
      map.addControl(new NcWMSColorbarControl(this.ncwmsContourLayer, {
        position: 'bottomright'
      }));
      autoscale = new NcWMSAutoscaleControl(this.ncwmsScalarLayer, {
        position: 'bottomright'
      });
      autoscale.addLayer(this.ncwmsContourLayer);
      map.addControl(autoscale);
      map.addControl(new NcWMSColorbarControl(this.ncwmsScalarLayer, {
        position: 'bottomright'}));
    }
    else if(this.props.scalarDataset) {
      map.addControl(new NcWMSAutoscaleControl(this.ncwmsScalarLayer, {
        position: 'bottomright'
      }));
      map.addControl(new NcWMSColorbarControl(this.ncwmsScalarLayer, {
        position: 'bottomright'
      }));
    }
    else if(this.props.contourDataset) {
      map.addControl(new NcWMSAutoscaleControl(this.ncwmsContourLayer, {
        position: 'bottomright'
      }));
      map.addControl(new NcWMSColorbarControl(this.ncwmsContourLayer, {
        position: 'bottomright'
      }));
    }    
  },

  componentWillUnmount: function () {
    this.map.off('click', this.onMapClick);
    this.map = null;
  },

  onMapClick: function () {
    //console.log('clicked on map');
  },

  componentWillReceiveProps: function (newProps) {
    
    // FIXME: This isn't ideal. Leaflet doesn't support /removing/
    // wmsParameters yet - https://github.com/Leaflet/Leaflet/issues/3441
    if(this.ncwmsScalarLayer) {
      delete(this.ncwmsScalarLayer.wmsParams.colorscalerange);
    }
    if(this.ncwmsContourLayer) {
      delete(this.ncwmsContourLayer.wmsParams.colorscalerange);
    }

    if(newProps.scalarDataset) {
      this.ncwmsScalarLayer.setParams(this.getWMSParams("scalar", newProps));
    }
    if(newProps.contourDataset) {
      this.ncwmsContourLayer.setParams(this.getWMSParams("contour", newProps));
    }
    if (this.state.area !== newProps.area) {
      this.handleNewArea(newProps.area);
    }
  },
  render: function () {
    return (
      <div className={styles.map}>
        <div ref={ (c) => this._map = c } className={styles.map} />
      </div>
    );
  },
});

module.exports.CanadaMap = CanadaMap;
