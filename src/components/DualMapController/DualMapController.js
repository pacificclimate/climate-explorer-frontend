import React from 'react';
import { Row, Col, Button, ButtonGroup, Glyphicon, Modal } from 'react-bootstrap';
import urljoin from 'url-join';
import Loader from 'react-loader';
import _ from 'underscore';
import axios from 'axios';

import { DualMap } from '../Map/DualMap';
import Selector from '../Selector/Selector';
import GeoExporter from '../GeoExporter';
import GeoLoader from '../GeoLoader';
import g from '../../core/geo';
import ModalMixin from '../ModalMixin';

import styles from './DualMapController.css';

var DualMapController = React.createClass({

  propTypes: {
    variable: React.PropTypes.string,
    comparand: React.PropTypes.string,
    meta: React.PropTypes.array,
    comparandMeta: React.PropTypes.array,
    onSetArea: React.PropTypes.func.isRequired,
  },

  mixins: [ModalMixin],

  /*
   * State items also set from meta object array Includes: 
   * - dataset 
   * - wmstime 
   * - variable
   */
  getInitialState: function () {
    return {
      scalarPalette: 'seq-Greys',
      scalarLogscale: false,
      contourPalette: 'x-Occam',
      numberOfContours: 10,
      contourLogscale: false,
      timeidx: 0,
    };
  },

  updateSelection: function (param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  updateTime: function (timeidx) {
    this.setState({
      timeidx: timeidx,
      wmstime: this.state.times[timeidx],
    });
  },

  updateDataset: function (uniqueId) {
    // Updates dataset in state. Updates time value to match new dataset

    this.selectedDataset = this.props.meta.filter(function (el) {
      return el.unique_id === uniqueId;
    })[0];
    
    this.secondaryDataset = _.findWhere(this.props.comparandMeta, {
      variable_id: this.state.comparand,
      timescale: this.selectedDataset.timescale,
      ensemble_member: this.selectedDataset.ensemble_member,
      start_date: this.selectedDataset.start_date,
      end_date: this.selectedDataset.end_date
    });

    this.requestTimeMetadata(uniqueId).then(response => {
      this.selectedDataset.times = response.data[uniqueId].times;
      
      this.setState({
        times: response.data[uniqueId].times,
        timeidx: 0, // Time indices may not be equivalent across datasets
        dataset: this.selectedDataset.unique_id,
        comparandDataset: this.secondaryDataset.unique_id,
        wmstime: response.data[uniqueId].times[0],
        variable: this.selectedDataset.variable_id,
      });
    });
  },

  findUniqueId: function () {
    if (this.props.meta.length > 0) {
      return this.props.meta[0].unique_id;
    }
  },

  handleSetArea: function (geojson) {
    this.setState({ area: geojson });
    this.props.onSetArea(geojson ? g.geojson(geojson).toWKT() : undefined);
  },

  requestTimeMetadata: function (uniqueId) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'metadata'),
      params: {
        model_id: uniqueId,
      },
    });
  },

  componentWillReceiveProps: function (nextProps) {

    this.selectedDataset = nextProps.meta[0];
    this.secondaryDataset = _.findWhere(nextProps.comparandMeta, {
      timescale: this.selectedDataset.timescale,
      start_date: this.selectedDataset.start_date,
      end_date: this.selectedDataset.end_date
    });

    this.requestTimeMetadata(this.selectedDataset.unique_id).then(response => {
      this.setState({
        times: response.data[this.selectedDataset.unique_id].times,
        timeidx: 0,
        dataset: this.selectedDataset.unique_id,
        comparandDataset: this.secondaryDataset.unique_id,
        wmstime: response.data[this.selectedDataset.unique_id].times[0],
        variable: this.selectedDataset.variable_id,
        comparand: this.secondaryDataset.variable_id,
      });
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before we have required data
    return JSON.stringify(nextState) !== JSON.stringify(this.state);
  },

  render: function () {

    var singleColourPalettes = [
      ['seq-Blues', 'light blues'],
      ['seq-BkBu', 'dark blues'],
      ['seq-Greens', 'light greens'],
      ['seq-BkGn', 'dark greens'],
      ['seq-Oranges', 'oranges'],
      ['seq-BuPu', 'purples'],
      ['seq-Greys', 'greys'],
      ['seq-BkYl', 'yellows'],
      ['x-Occam', 'rainbow'],
      ['default', 'ocean'],
      ['seq-cubeYF', 'cube'],
      ['psu-magma', 'sunset']
    ];

    var colorScales = [['false', 'Linear'], ['true', 'Logarithmic']];

    // Determine available datasets and display selector if multiple
    var ids = this.props.meta.map(function (el) {
      return [el.unique_id, `${el.ensemble_member} ${el.start_date}-${el.end_date} ${el.timescale}`];
    }).sort(function (a, b) {
      return a[1] > b[1] ? 1 : -1;
    });

    var datasetSelector;
    if (ids.length > 1) {
      datasetSelector = (<Selector
        label={"Select Dataset"}
        onChange={this.updateDataset}
        items={ids} value={this.state.dataset}
        />
      );
    }

    var timeOptions = _.map(this.state.times, function (v, k) {
      return [k, v];
    }.bind(this));

    var map, mapFooter;
    if (this.state.dataset) {
      map = (
        <DualMap
          scalarPalette={this.state.scalarPalette}
          scalarLogscale={this.state.scalarLogscale}
          contourPalette={this.state.contourPalette}
          numberOfContours={parseInt(this.state.numberOfContours)}
          contourLogscale={this.state.contourLogscale}
          time={this.state.wmstime}
          dataset={this.state.dataset}
          comparandDataset={this.state.comparandDataset}
          variable={this.state.variable}
          comparand={this.state.comparand}
          onSetArea={this.handleSetArea}
          area={this.state.area}
        />
      );
      var runMetadata = this.props.meta.find(match => {return match.unique_id === this.state.dataset})
      mapFooter = (
        <h5>
          Dataset: {runMetadata.ensemble_member} &nbsp;
          {runMetadata.start_date} - {runMetadata.end_date} &nbsp;
          Time: {this.state.wmstime}
        </h5>
      );

    } else {
      map = <Loader />;
      mapFooter = "";
    }

    return (
      <div>
        <Row>
          <Col lg={12}>
            <div className={styles.map}>

              {map}

              <div className={styles.controls}>
                <ButtonGroup vertical>
                  <Button onClick={this.open} title='Map Settings'><Glyphicon glyph='menu-hamburger' /></Button>
                  <GeoExporter.Modal area={this.state.area} title='Export polygon' />
                  <GeoLoader onLoadArea={this.handleSetArea} title='Import polygon' />
                </ButtonGroup>
              </div>
              <div className={styles.footer}>
                {mapFooter}
              </div>
            </div>
          </Col>
        </Row>

        <Modal show={this.state.showModal} onHide={this.close} >

          <Modal.Header closeButton>
            <Modal.Title>Map Settings</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            { datasetSelector }
            <Selector
              label={"Time Selection"}
              onChange={this.updateTime}
              items={timeOptions}
            />
            <Selector
              label={"Block Colour Palette"}
              onChange={this.updateSelection.bind(this, 'scalarPalette')}
              items={singleColourPalettes}
              value={this.state.scalarPalette}
            />
            <Selector
              label={"Block Color scale"}
              onChange={this.updateSelection.bind(this, 'scalarLogscale')}
              items={colorScales}
              value={this.state.logscale}
            />
            <Selector
              label={"Isoline Colour Palette"}
              onChange={this.updateSelection.bind(this, 'contourPalette')}
              items={singleColourPalettes}
              value={this.state.contourPalette}
            />
            <Selector
              label={"Number of Isolines"}
              onChange={this.updateSelection.bind(this, 'numberOfContours')}
              items={[4, 6, 8, 10, 12]}
              value={this.state.numberOfContours}
            />
            <Selector
              label={"Isoline Colour scale"}
              onChange={this.updateSelection.bind(this, 'contourLogscale')}
              items={colorScales}
              value={this.state.contourLogscale}
            />


          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>

        </Modal>

      </div>
    );
  },
});

export default DualMapController;
