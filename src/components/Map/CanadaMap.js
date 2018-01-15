/***************************************************************
 * CanadaMap.js - display component using ncWMS and Leaflet.
 * Will display up to two map layers, one as shaded color blocks,
 * and one as isolines, or either independently, over a tiled
 * background. Origin and bounds display all of Canada.
 *
 * Child of (and viewer for) MapController.
 *
 * Props passed to configure shaded color map:
 *  - rasterPalette (name of an ncWMS color palette)
 *  - rasterLogscale (true for logarithmic color scale)
 *  - rasterDataset (name of the netCDF datafile)
 *  - rasterVariable (name of the variable)
 *
 * All the same props are passed to configure isolines,
 * prefixed "isoline", plus an additional prop to describe
 * the isoline layer: numberOfContours.
 *
 * other props: time (selects a time slice),
 *              area (configures an area to highlight).
 *
 *****************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import _ from 'underscore';
import leafletImage from 'leaflet-image';
import { Map, TileLayer } from 'react-leaflet';
import 'leaflet-draw';
import 'proj4';
import 'proj4leaflet';
import { saveAs } from 'filesaver.js';
import axios from 'axios';

import utils from './utils';
import NcWMSColorbarControl from '../../core/leaflet-ncwms-colorbar';
import NcWMSAutoscaleControl from '../../core/leaflet-ncwms-autoset-colorscale';

import styles from './map.css';

class CanadaMap extends React.Component {
  static propTypes = {
    rasterPalette: PropTypes.string,
    rasterLogscale: PropTypes.string,
    isolinePalette: PropTypes.string,
    numberOfContours: PropTypes.number,
    isolineLogscale: PropTypes.string,
    rasterDataset: PropTypes.string,
    isolineDataset: PropTypes.string,
    rasterVariable: PropTypes.string,
    isolineVariable: PropTypes.string,
    onSetArea: PropTypes.func.isRequired,
    area: PropTypes.object,
    origin: PropTypes.object,
  };

  //generates initial (and unchanging) map settings - origin, projection, etc.
  static defaultProps = {
    crs: new L.Proj.CRS(
      'EPSG:4326',
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
      {
        resolutions: utils.generateResolutions(0.09765625, 10),
        // If we don't set the origin correctly, then the projection transforms BC Albers coordinates to lat-lng
        // coordinates incorrectly. You have to know the magic origin value.
        //
        // It is also probably important to know that the bc_osm tile set is a TMS tile set, which has axes
        // transposed with respect to Leaflet axes. The proj4leaflet documentation incorrectly states that
        // there is a CRS constructor `L.Proj.CRS.TMS` for TMS tilesets. It is absent in the version
        // (1.0.2) we are using. It exists in proj4leaflet ver 0.7.1 (formerly in use here), and shows that the
        // correct value for the origin option is `[bounds[0], bounds[3]]`, where `bounds` is the 3rd argument
        // of the TMS constructor.
        origin: [-150, 90],
      }
    ),
    version: '1.1.1',
    srs: 'EPSG:4326',
    origin: { lat: 60, lon: -100, zoom: 0 },
    oldschool: false,
  };

  state = {
    area: undefined,
  };

  //get map formatting parameters for the raster or isoline layers.
  getWMSParams = (layer, props = this.props) => {
    var layerName = props[`${layer}Dataset`] + "/" + props[`${layer}Variable`];

    var params = {
      layers: layerName,
      noWrap: true,
      format: "image/png",
      transparent: true,
      time: props[`${layer}Time`],
      numcolorbands: 249,
      version: "1.1.1",
      srs: "EPSG:4326",
      logscale: "false"
    };
    if(layer == "raster") {
      params.styles = `default-scalar/${props.rasterPalette}`;
      params.opacity = .7;
      params.zIndex = 2;
      if(props.rasterLogscale=="true" && !_.isUndefined(this.layerRange.raster)) {
        //clip the dataset to > 0, values of 0 or less do not have a
        //non-complex logarithm
        params.logscale = props.rasterLogscale;
        var min = Math.max(this.layerRange.raster.min, Number.EPSILON);
        var max = Math.max(this.layerRange.raster.max, Number.EPSILON * 2);
        params.colorscalerange = `${min},${max}`;
        params.abovemaxcolor="transparent";
        params.belowmincolor="transparent";
      }
    }
    else if (layer == "isoline") {
      params.styles = `colored_contours/${props.isolinePalette}`;
      params.numContours = props.numberOfContours;
      params.opacity = 1;
      if(props.isolineLogscale=="true" && !_.isUndefined(this.layerRange.isoline)) {
        //clip the dataset to > 0
        params.logscale = props.isolineLogscale;
        var min = Math.max(this.layerRange.isoline.min, Number.EPSILON);
        var max = Math.max(this.layerRange.isoline.max, Number.EPSILON * 2);
        params.colorscalerange = `${min},${max}`;
        params.abovemaxcolor="transparent";
        params.belowmincolor="transparent";
      }
    }
    return params;
  };

  /*
   * Queries WMS about the minimum and maximum values of a map.
   * Used primarily to configure logarithmic shading, which
   * requires either all values greater than zero, or clipping
   * the data range.
   * Updates itself and MapController with the results.
   */
  updateLayerMinmax = (layer, props) => {
    try {
      var bounds = this.map.getBounds();
      if(bounds.getWest() == bounds.getEast()) {
        //This netCDF file has an invalid bounding box, presumably because it has been
        //through a longitude normalization process.
        //See https://github.com/pacificclimate/climate-explorer-data-prep/issues/11
        //As a result, longitudes in the file go from 0 to 180, then -180 to
        //0. This means the westmost boundary and the eastmost boundary
        //are both zero (actually -.5675 or something like that, the center of a cell
        //with one edge at 0.)
        //Passing a bounding box with identical eastmost and westmost bounds to
        //ncWMS results in an error, so create a new Canada-only bounding box and
        //ignore the worldwide extent of this map.
        var corner1 = L.latLng(90, -50);
        var corner2 = L.latLng(40, -150);
        bounds = L.latLngBounds(corner1, corner2);
      }
      var minmaxParams = _.pick(this.getWMSParams(layer, props),
        "layers", "styles", "version", "srs", "time");
      _.extend(minmaxParams, {
        styles: 'default-scalar',
        request: 'GetMetadata',
        item: 'minmax',
        crs: this.props.srs,
        elevation: 0,
        width: 100,
        height: 100,
        bbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`
      })
      axios (NCWMS_URL,
        {params: minmaxParams}).then(response => {
        this.layerRange[layer] = response.data;
        props.updateMinmax(layer, response.data);
      });
    }
    catch (err) {
      //Because the map loads data asynchronously, it may not be ready yet,
      //throwing an error on this.map.getBounds(). This error can be safely
      //ignored: the minmax data only needs to be available by the time the
      //user opens the map options menu, and by then it should be, unless
      //something is wrong with the ncWMS server and no map rasters are
      //generated at all.
      //Any other error should be rethrown so it can be noticed and debugged.
      //NOTE: rethrowing errors loses stacktrace in Chrome, see
      //https://bugs.chromium.org/p/chromium/issues/detail?id=60240
      if(err.message != "Set map center and zoom first.") {
        throw err;
      }
    }
  };

  clearMapFeatures = () => {
    this.drawnItems.getLayers().map(function (layer) {
      this.drawnItems.removeLayer(layer);
    }.bind(this));
  };

  // generally called for a new area originating from within this component
  // propagate the area up the component stack
  handleSetArea = (geojson) => {
    this.setState({ area: geojson });
    this.props.onSetArea(geojson);
  };

  // area received from props; don't propagate back up the component stack
  handleNewArea = (geojson) => {
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
  };

  //Map should only rerender when something has changed
  shouldComponentUpdate(nextProps, nextState) {
    return !(_.isEqual(nextState, this.state) && _.isEqual(nextProps, this.props));
  }

  //initializes the map, loads data, and generates controls
  //NOTE: the buttons that open the "Map Settings" menu are
  //actually provided by MapController, not this component.
  //CanadaMap draws colourbars, the autoscale button, and the
  //area drawing and manipulation controls.
  componentDidMount() {
    this.layerRange = {};
    var map;
    if (this.props.oldschool) {
      map = this.map = L.map(this._map, {
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
    } else {
      map = this.map;
    }


    if(this.props.rasterDataset) {
      this.ncwmsRasterLayer=L.tileLayer.wms(NCWMS_URL, this.getWMSParams("raster")).addTo(map);
      this.updateLayerMinmax("raster", this.props);
    }
    if(this.props.isolineDataset) {
      this.ncwmsIsolineLayer=L.tileLayer.wms(NCWMS_URL, this.getWMSParams("isoline")).addTo(map);
      this.updateLayerMinmax("isoline", this.props);
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

    //Print control is temporarily removed until map printing is working.
    //See https://github.com/pacificclimate/climate-explorer-frontend/issues/77
    //map.addControl(new PrintControl());

    var autoscale, rasterBar, isolineBar;
    //create controls for each map layer currently defined
    if(this.props.rasterDataset) {
      [autoscale, rasterBar] = this.makeColourControls(this.ncwmsRasterLayer);
    }
    if(this.props.isolineDataset) {
      [autoscale, isolineBar] = this.makeColourControls(this.ncwmsIsolineLayer);
    }

    //all controls are positioned at leaflet "bottomright"
    //(see http://leafletjs.com/reference-1.2.0.html#control )
    //and stack vertically up the side of the map. The first-added
    //control ends up at the bottom, the most recently added on top.
    //We want autoscale on top if there's only one colourbar, but
    //between the bars if there's two (to indicate it affects both layers)
    if(this.props.isolineDataset && this.props.rasterDataset) {
      map.addControl(rasterBar);
      map.addControl(autoscale);
      map.addControl(isolineBar);
    }
    else if(this.props.isolineDataset){
      map.addControl(isolineBar);
      map.addControl(autoscale);
    }
    else if(this.props.rasterDataset) {
      map.addControl(rasterBar);
      map.addControl(autoscale);
    }

    //Set and display an area if one was received
    if(this.props.area && !this.state.area) {
      this.handleNewArea(this.props.area);
    }
  }

  //returns an array of two controls registered to the layer:
  //a coloured bar legend, and an autoscale button
  //the autoscale button is registered to every layer this function
  //has been called on. (It is assumed that all layers autoscale together)
  makeColourControls = (layer) => {
    if(this.autoscaleControl) {
      this.autoscaleControl.addLayer(layer);
    }
    else {
      this.autoscaleControl = new NcWMSAutoscaleControl(layer, {
        position: 'bottomright'
      });
    }
    return [
      this.autoscaleControl,
      new NcWMSColorbarControl(layer, {position: 'bottomright'})
    ];
  };

  componentWillUnmount() {
    this.map.off('click', this.onMapClick);
    // this.map = null;
  }

  onMapClick = () => {
    //console.log('clicked on map');
  };

  componentWillReceiveProps(newProps) {
    //MapController has a modal menu, and has to rerender itself (and CanadaMap)
    //when the modal opens or closes, but the map itself doesn't need to be
    //redrawn unless something has actually changed.
    if(_.isEqual(this.props, newProps)) {
      return;
    }

    // FIXME: This isn't ideal. Leaflet doesn't support /removing/
    // wmsParameters yet - https://github.com/Leaflet/Leaflet/issues/3441
    if(this.ncwmsRasterLayer) {
      delete(this.ncwmsRasterLayer.wmsParams.colorscalerange);
      delete(this.ncwmsRasterLayer.wmsParams.layers);
    }
    if(this.ncwmsIsolineLayer) {
      delete(this.ncwmsIsolineLayer.wmsParams.colorscalerange);
      delete(this.ncwmsIsolineLayer.wmsParams.layers);
    }

    //Both ncWMS and Leaflet use an "opacity" parameter. When a map layer is
    //initialized, its opacity is set from the "opacity" parameter. After the
    //layer is initialized, if it receives another opacity parameter via
    //setParams, the opacity value is sent to ncWMS. Since Leaflet opacities
    //are 0-1 and ncWMS opacities are required to be integers, this causes a
    //ncWMS ServiceException. Omit the opacity parameter.
    if(newProps.rasterDataset) {
      var rasterParams = _.omit(this.getWMSParams("raster", newProps), "opacity");
      this.ncwmsRasterLayer.setParams(rasterParams);
      this.updateLayerMinmax("raster", newProps);
    }
    if(newProps.isolineDataset) {
      var isolineParams = _.omit(this.getWMSParams("isoline", newProps), "opacity");
      this.ncwmsIsolineLayer.setParams(isolineParams);
      this.updateLayerMinmax("isoline", newProps);
    }
    if (this.state.area !== newProps.area) {
      this.handleNewArea(newProps.area);
    }
  }

  render() {
    console.log('CanadaMap: rendering', this.props);
    if (this.props.oldschool) {
      return (
        <div className={styles.map}>
          <div ref={(c) => this._map = c} className={styles.map}/>
        </div>
      );
    }

    return (
      <Map
        crs={this.props.crs}
        center={{lat: 60, lng: -100}}
        zoom={0}
        minZoom={0}
        maxZoom={10}
        maxBounds={L.latLngBounds([[40, -150], [90, -50]])}
        ref={(c) => this.map = c.leafletElement}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url={TILECACHE_URL + '/1.0.0/na_4326_osm/{z}/{x}/{y}.png'}
          subdomains={'abc'}
          noWrap
          maxZoom={10}
        />
      </Map>
    );
  }
}

module.exports.CanadaMap = CanadaMap;
