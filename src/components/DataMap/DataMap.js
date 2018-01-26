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
  updateSingleStateLeaflet,
} from '../../core/react-leaflet-utils';
import CanadaBaseMap from '../CanadaBaseMap';
import DataLayer from './DataLayer';
import NcWMSColorbarControl from '../NcWMSColorbarControl';
import NcWMSAutosetColorscaleControl from '../NcWMSAutosetColorscaleControl';


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
    super(props);

    this.state = {
      rasterLayer: null,
      isolineLayer: null,
    };
  }

  // Handler for base map ref.

  handleMapRef = makeHandleLeafletRef('map').bind(this);

  // Handlers for data layer refs.

  // TODO: Push into DataLayer? Difficulty because map isn't in React
  // context of DataLayer, despite what one might expect from React Leaflet
  // documentation.
  // It's not so bad here, but would be better there.
  updateLayerRange = (layerType, props, onChangeRange) => {
    try {
      let bounds = this.map.getBounds();
      if (bounds.getWest() === bounds.getEast()) {
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
        const corner1 = L.latLng(90, -50);
        const corner2 = L.latLng(40, -150);
        bounds = L.latLngBounds(corner1, corner2);
      }
      getLayerMinMax(layerType, props, bounds).then(response => {
        onChangeRange(response.data);
      });
    } catch (err) {
      // TODO: This whole try-catch block might be unnecessary now
      // that this function is invoked only on layer load event.
      // Because the map loads data asynchronously, it may not be ready yet,
      // throwing an error on this.map.getBounds(). This error can be safely
      // ignored: the minmax data only needs to be available by the time the
      // user opens the map options menu, and by then it should be, unless
      // something is wrong with the ncWMS server and no map rasters are
      // generated at all.
      // Any other error should be rethrown so it can be noticed and debugged.
      // NOTE: rethrowing errors loses stacktrace in Chrome, see
      // https://bugs.chromium.org/p/chromium/issues/detail?id=60240
      if (err.message !== 'Set map center and zoom first.') {
        throw err;
      }
    }
  };

  handleLayerRef(layerType, layer) {
    const leafletElement = layer && layer.leafletElement;
    if (leafletElement) {
      const onChangeRange = {
        raster: this.props.onChangeRasterRange,
        isoline: this.props.onChangeIsolineRange,
      }[layerType];
      leafletElement.on('load', () => {
        this.updateLayerRange(layerType, this.props, onChangeRange);
      });
    }
    this.setState({ [`${layerType}Layer`]: leafletElement });  // Ewww
  }

  handleRasterLayerRef = this.handleLayerRef.bind(this, 'raster');
  handleIsolineLayerRef = this.handleLayerRef.bind(this, 'isoline');

  // Handlers for area selection. Converts area to GeoJSON.

  handleAreaCreatedOrEdited = (e) => {
    const area = e.layer.toGeoJSON();
    area.properties.source = 'PCIC Climate Explorer';
    this.props.onSetArea(area);
  };

  handleAreaDeleted = () => {
    this.props.onSetArea(undefined);
  };

  // Lifecycle event handlers

  shouldComponentUpdate(nextProps, nextState) {
    const propChange = !_.isEqual(nextProps, this.props);
    const stateChange = !_.isEqual(nextState, this.state);
    const b = propChange || stateChange;
    return b;
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  render() {
    // TODO: Add positioning for autoset
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

        <NcWMSColorbarControl
          layer={this.state.isolineLayer}
          // update when any isoline prop changes
          dataset={this.state.isolineDataset}
          variable={this.props.isolineVariable}
          time={this.props.isolineTime}
          palette={this.props.isolinePalette}
          logscale={this.props.isolineLogscale}
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
