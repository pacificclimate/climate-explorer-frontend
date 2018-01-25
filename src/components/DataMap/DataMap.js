import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import { FeatureGroup, GeoJSON } from 'react-leaflet';
import 'proj4';
import 'proj4leaflet';
import { EditControl } from 'react-leaflet-draw';

import './DataMap.css';
import { getLayerMinMax } from '../../data-services/ncwms';
import {
  makeHandleLeafletRef,
  updateSingleStateLeaflet
} from '../../core/react-leaflet-utils';
import CanadaBaseMap from '../CanadaBaseMap';
import DataLayer from './DataLayer';
import StaticControl from '../StaticControl';
import NcWMSColorbarControl from '../NcWMSColorbarControl';
import NcWMSAutosetColorscaleControl from '../NcWMSAutosetColorscaleControl';

import { shallowDiff, shallowDiffStr } from '../../core/debug-utils';


class DataMap extends React.Component {
  // This component provides data display layers (DataLayer) for up to two
  // variables, plus a polygon layer and polygon editing tools, all rendered
  // within a base map (CanadaBaseMap).
  // Renders its children within the base map.

  static propTypes = {
    rasterDataset: PropTypes.string,
    rasterVariable: PropTypes.string,
    rasterTime: PropTypes.string,
    rasterPalette: PropTypes.string,
    rasterLogscale: PropTypes.string, // arg for ncwms: 'true' | 'false'
    rasterRange: PropTypes.object,
    onChangeRasterRange: PropTypes.func.isRequired,

    isolineDataset: PropTypes.string,
    isolineVariable: PropTypes.string,
    isolineTime: PropTypes.string,
    isolinePalette: PropTypes.string,
    numberOfContours: PropTypes.number,
    isolineLogscale: PropTypes.string, // arg for ncwms: 'true' | 'false'
    isolineRange: PropTypes.object,
    onChangeIsolineRange: PropTypes.func.isRequired,

    area: PropTypes.object,
    onSetArea: PropTypes.func.isRequired,
  };

  constructor(props) {
    console.log('DataMap.constructor')
    super(props);

    this.state = {
      rasterLayer: null,
      isolineLayer: null,
    };
  }

  // Handlers for wrangling base map and data layer refs.

  handleMapRef = makeHandleLeafletRef('map').bind(this);

  handleRasterLayerRef = updateSingleStateLeaflet.bind(this, 'rasterLayer');
  handleIsolineLayerRef = updateSingleStateLeaflet.bind(this, 'isolineLayer');

  // Handlers for area selection. Converts area to GeoJSON.

  handleAreaCreatedOrEdited = (e) => {
    const area = e.layer.toGeoJSON();
    area.properties.source = 'PCIC Climate Explorer';
    this.props.onSetArea(area);
  };

  handleAreaDeleted = () => {
    this.props.onSetArea(undefined);
  };

  // TODO: Rename
  // TODO: Push into DataLayer
  updateLayerMinmax = (layer, props, onChangeRange) => {
    try {
      var bounds = this.map.getBounds();
      if (bounds.getWest() == bounds.getEast()) {
        // This netCDF file has an invalid bounding box, presumably because it has been
        // through a longitude normalization process.
        // See https://github.com/pacificclimate/climate-explorer-data-prep/issues/11
        // As a result, longitudes in the file go from 0 to 180, then -180 to
        // 0. This means the westmost boundary and the eastmost boundary
        // are both zero (actually -.5675 or something like that, the center of a cell
        // with one edge at 0.)
        // Passing a bounding box with identical eastmost and westmost bounds to
        // ncWMS results in an error, so create a new Canada-only bounding box and
        // ignore the worldwide extent of this map.
        var corner1 = L.latLng(90, -50);
        var corner2 = L.latLng(40, -150);
        bounds = L.latLngBounds(corner1, corner2);
      }
      getLayerMinMax(layer, props, bounds).then(response => {
        onChangeRange(response.data);
      });
    } catch (err) {
      // Because the map loads data asynchronously, it may not be ready yet,
      // throwing an error on this.map.getBounds(). This error can be safely
      // ignored: the minmax data only needs to be available by the time the
      // user opens the map options menu, and by then it should be, unless
      // something is wrong with the ncWMS server and no map rasters are
      // generated at all.
      // Any other error should be rethrown so it can be noticed and debugged.
      // NOTE: rethrowing errors loses stacktrace in Chrome, see
      // https://bugs.chromium.org/p/chromium/issues/detail?id=60240
      if (err.message != "Set map center and zoom first.") {
        throw err;
      }
    }
  };

  updateLayerRanges() {
    // TODO: Push into DataLayer
    if (this.props.rasterDataset) {
      this.updateLayerMinmax('raster', this.props, this.props.onChangeRasterRange);
    }
    if (this.props.isolineDataset) {
      this.updateLayerMinmax('isoline', this.props, this.props.onChangeIsolineRange);
    }
  }

  // Lifecycle event handlers

  shouldComponentUpdate(nextProps, nextState) {
    const propChange = !_.isEqual(nextProps, this.props);
    const stateChange = !_.isEqual(nextState, this.state);
    const b = propChange || stateChange;
    return b;
  }

  componentDidMount() {
    // TODO: Push into DataLayer
    this.updateLayerRanges();
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log('DataMap.componentDidUpdate: props', shallowDiff(prevProps, this.props))
    // console.log('DataMap.componentDidUpdate: props', prevProps, this.props)

    // console.log('DataMap.componentDidUpdate: state', shallowDiffStr(prevState, this.state))
    // TODO: Push into DataLayer
    this.updateLayerRanges();
    // if (!_.isEqual(prevProps.rasterRange, this.props.rasterRange)) {
    //   console.log('DataMap.componentDidUpdate: autoscaling')
    //   this.rasterBar.refreshValues();
    //   this.autoscale.autoscale();
    // }
    // if (this.rasterLayer) {
    //   this.rasterBar.refreshValues();
    // }
  }

  render() {
    // TODO: Add isoline colourbar and add positioning for autoset
    return (
      <CanadaBaseMap
        mapRef={this.handleMapRef}
      >
        <DataLayer
          layerType='raster'
          dataset={this.props.rasterDataset}
          variable={this.props.rasterVariable}
          time={this.props.rasterTime}
          palette={this.props.rasterPalette}
          logscale={this.props.rasterLogscale}
          range={this.props.rasterRange}

          onLayerRef={this.handleRasterLayerRef}
          onChangeRange={this.props.onChangeRasterRange}
        />

        <NcWMSColorbarControl
          layer={this.state.rasterLayer}
          // update when any raster prop changes
          dataset={this.state.rasterDataset}
          variable={this.props.rasterVariable}
          time={this.props.rasterTime}
          palette={this.props.rasterPalette}
          logscale={this.props.rasterLogscale}
        />

        <NcWMSAutosetColorscaleControl
          layers={[this.state.rasterLayer, this.state.isolineLayer]}
        />

        <DataLayer
          layerType='isoline'
          dataset={this.props.isolineDataset}
          variable={this.props.isolineVariable}
          time={this.props.isolineTime}
          palette={this.props.isolinePalette}
          logscale={this.props.isolineLogscale}
          range={this.props.isolineRange}

          onLayerRef={this.handleIsolineLayerRef}
          onChangeRange={this.props.onChangeIsolineRange}
        />

        <FeatureGroup>
          <EditControl
            position='topleft'
            draw={{
              marker: false,
              circle: false,
              polyline: false,
            }}
            onCreated={this.handleAreaCreatedOrEdited}
            onEdited={this.handleAreaCreatedOrEdited}
            onDeleted={this.handleAreaDeleted}
          />
        </FeatureGroup>

        {
          this.props.area &&
          <GeoJSON
            data={this.props.area}
          />
        }

        { this.props.children }

      </CanadaBaseMap>
    );
  }
}

export default DataMap;
