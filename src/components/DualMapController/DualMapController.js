import React from 'react';
import { Row, Col, Button, ButtonGroup, Glyphicon, Modal } from 'react-bootstrap';
import urljoin from 'url-join';
import Loader from 'react-loader';
import _ from 'underscore';
import axios from 'axios';

import { CanadaMap } from '../Map/CanadaMap';
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
    variable2: React.PropTypes.string,
    meta: React.PropTypes.array,
    onSetArea: React.PropTypes.func.isRequired,
  },

  mixins: [ModalMixin],

  /*
   * State items also set from meta object array Includes: - dataset - wmstime -
   * variable
   */
  getInitialState: function () {
    return {
      styles: 'boxfill/ferret',
      timeidx: 0,
      logscale: false,
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
    console.log("mapcontroller.updateDataser called");
    // Updates dataset in state. Updates time value to match new dataset

    this.selectedDataset = this.props.meta.filter(function (el) {
      return el.unique_id === uniqueId;
    })[0];

    this.requestTimeMetadata(uniqueId).then(response => {
      this.selectedDataset.times = response.data[uniqueId].times;

      this.setState({
        times: response.data[uniqueId].times,
        timeidx: 0, // Time indices may not be equivalent across datasets
        dataset: this.selectedDataset.unique_id,
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
    //console.log("mapController will receive props called");
    //console.log("the props received are:");
    //console.log(nextProps);
    this.selectedDataset = nextProps.meta[0];
    this.secondaryDataset = nextProps.meta2[0];

    this.requestTimeMetadata(this.selectedDataset.unique_id).then(response => {
      this.setState({
        times: response.data[this.selectedDataset.unique_id].times,
        timeidx: 0,
        dataset: this.selectedDataset.unique_id,
        secondary: this.secondaryDataset.unique_id,
        wmstime: response.data[this.selectedDataset.unique_id].times[0],
        variable: this.selectedDataset.variable_id,
        variable2: this.secondaryDataset.variable_id,
      });
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before we have required data
    return JSON.stringify(nextState) !== JSON.stringify(this.state);
  },

  //FIXME: This is a bad idea of a function intended to compensate for the fact
  //that ncWMS requires timestamps within an NC file to be monotonic, that is
  //it rejects files with seasonal averages because the associated dates are out of
  //chronological order.
  //There must be a better way to do this. Delete this function as soon as it is found.
  timestringToPeriod: function(timestring) {
    var day = timestring.slice(5,10);
    var names = {
        "01-16": "January",
        "02-15": "February",
        "03-16": "March",
        "04-16": "April",
        "05-16": "May",
        "06-16": "June",
        "07-16": "July",
        "08-16": "August",
        "09-16": "September",
        "10-16": "October",
        "11-16": "November",
        "12-16": "December",
        "01-15": "Winter-DJF",
        "04-17": "Spring-MAM",
        "07-17": "Summer-JJA",
        "10-17": "Fall-SON",
        "07-02": "Annual"
    };
    if(day in names) {
      return names[day];
    }
    else {
      return timestring;
    }
  },

  render: function () {
    console.log("MAPCONTROLLER RERENDERED!");

    var pallettes = [['boxfill/ferret', 'ferret'],
                     ['boxfill/rainbow', 'rainbow'],
                     ['boxfill/occam', 'occam'],
                     ['boxfill/occam_inv', 'inverted occam'],
                    ];
    var colorScales = [['false', 'Linear'], ['true', 'Logarithmic']];

    // Determine available datasets and display selector if multiple
    var ids = this.props.meta.map(function (el) {
      var period = el.unique_id.split('_').slice(5)[0];
      period = period.split('-').map(function (datestring) {return datestring.slice(0, 4);}).join('-');
      var l = [el.unique_id, el.unique_id.split('_').slice(4, 5) + ' ' + period];
      return l;
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
      return [k, this.timestringToPeriod(v)];
    }.bind(this));

    var map, mapFooter;
    if (this.state.dataset) {
      map = (
        <DualMap
          logscale={this.state.logscale}
          styles={this.state.styles}
          time={this.state.wmstime}
          dataset={this.state.dataset}
          dataset2={this.state.secondary}
          variable={this.state.variable}
          variable2={this.state.variable2}
          onSetArea={this.handleSetArea}
          area={this.state.area}
        />
      );
      console.log("Map call from MapController = ");
      console.log(map);
      var timestamp = new Date(Date.parse(this.state.times[0]));
      var year = timestamp.getFullYear();
      var runMetadata = this.props.meta.find(match => {return match.unique_id === this.state.dataset})
      var run = runMetadata.ensemble_member;

      // FIXME: Time period should be determined from the metadata API
      // which currently doesn't give time bounds information. See here:
      // https://github.com/pacificclimate/climate-explorer-backend/issues/44
      // When that issue is fixed, this code needs to be updated
      mapFooter = (
        <h5>
          Dataset: {run} &nbsp;
          {year - 15} - {year + 14} &nbsp;
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
              label={"Colour Pallette"}
              onChange={this.updateSelection.bind(this, 'styles')}
              items={pallettes}
              value={this.state.styles}
            />
            <Selector
              label={"Color scale"}
              onChange={this.updateSelection.bind(this, 'logscale')}
              items={colorScales}
              value={this.state.logscale}
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
