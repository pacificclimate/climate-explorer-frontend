import React, { PropTypes, Component } from 'react';
import { Input, Row, Col, ButtonGroup, DropdownButton, Button, MenuItem } from 'react-bootstrap';
import _ from 'underscore';
import urljoin from 'url-join';
import saveAs from 'filesaver.js';

import classNames from 'classnames';

import { CanadaMap } from '../Map/CanadaMap';
import ExperimentSelector from '../ExperimentSelector';
import Selector from '../Selector/Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import GeoExporter from '../GeoExporter';
import GeoLoader from '../GeoLoader';
import g from '../../core/geo';

import styles from './MapController.css';

var MapController = React.createClass({

  propTypes: {
    variable: React.PropTypes.string,
    meta: React.PropTypes.array,
    onSetArea: React.PropTypes.func.isRequired,
  },

  /**
   * State items also set from meta object array
   * Includes:
   *   - dataset
   *   - wmstime
   *   - variable
   */
  getInitialState: function () {
    return {
      styles: "boxfill/ferret",
      timeidx: 0,
      logscale: false
    }
  },

  updateSelection: function(param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  updateTime: function(timeidx) {
    this.setState({
      timeidx: timeidx,
      wmstime: this.selectedDataset.times[timeidx]
    })
  },

  updateDataset: function(unique_id) {
    // Updates dataset in state. Updates time value to match new dataset

    this.selectedDataset = this.props.meta.filter(function(el){
      return el.unique_id == unique_id
    })[0]

    this.requestTimeMetadata(unique_id).done(function(data) {
      this.selectedDataset.times = data[unique_id].times;

      this.setState({
        dataset: this.selectedDataset.unique_id,
        wmstime: this.selectedDataset.times[this.state.timeidx],
        variable: this.selectedDataset.variable_id
      });
    }.bind(this))
  },

  findUniqueId: function() {
    if (this.props.meta.length > 0) {
      return this.props.meta[0].unique_id;
    }
  },

  handleSetArea: function(geojson) {
    this.setState({area: geojson});
    this.props.onSetArea(g.geojson(geojson).toWKT());
  },

  requestTimeMetadata: function(unique_id) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'metadata'),
      crossDomain: true,
      data: {
        model_id: unique_id
      }
    });
  },

  componentWillReceiveProps: function(nextProps) {
    this.selectedDataset = nextProps.meta[0]

    this.requestTimeMetadata(this.selectedDataset.unique_id).done(function(data) {
      this.selectedDataset.times = data[this.selectedDataset.unique_id].times;

      this.setState({
        dataset: this.selectedDataset.unique_id,
        wmstime: this.selectedDataset.times[this.state.timeidx],
        variable: this.selectedDataset.variable_id
      });

    }.bind(this))
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    // This guards against re-rendering before we have required data
    return JSON.stringify(nextState) !== JSON.stringify(this.state)
  },

  render: function () {

    var pallettes = [['boxfill/ferret', 'ferret'],
                     ['boxfill/rainbow', 'rainbow'],
                     ['boxfill/occam', 'occam'],
                     ['boxfill/occam_inv', 'inverted occam']
                    ]
    var color_scales = [['false', 'Linear'], ['true', 'Logarithmic']]
    var ids = this.props.meta.map(function(el) {
      var period = el.unique_id.split('_').slice(5)[0]
      var period = period.split('-').map(function(datestring){return datestring.slice(0,4)}).join('-');
      var l = [el.unique_id, el.unique_id.split('_').slice(4,5) + ' ' + period ];
      return l
    }).sort(function(a,b){
      return a[1] > b[1] ? 1 : -1;
    });

    return (
      <div>
        <Row>
          <Col lg={12}>
            <div className={styles.map}>
              <CanadaMap
              logscale={this.state.logscale}
              styles={this.state.styles}
              time={this.state.wmstime}
              dataset={this.state.dataset}
              variable={this.state.variable}
              onSetArea={this.handleSetArea}
              area={this.state.area}>
              <div className={styles.controls}>
                <Row>
                  <Col lg={4} md={4}>
                    <TimeOfYearSelector onChange={this.updateTime} />
                  </Col>
                  <Col lg={4} md={4}>
                    <Selector label={"Dataset"} onChange={this.updateDataset} items={ids} />
                  </Col>
                  <Col lg={4} md={4}>
                    <GeoExporter.Modal area={this.state.area} />
                    <GeoLoader onLoadArea={this.handleSetArea} />
                  </Col>
                </Row>
                <Row>
                  <Col lg={4} md={4}>
                    <Selector label={"Color pallette"} onChange={this.updateSelection.bind(this, 'styles')} items={pallettes} />
                  </Col>
                  <Col lg={4} md={4}>
                    <Selector label={"Color scale"} onChange={this.updateSelection.bind(this, 'logscale')} items={color_scales} />
                  </Col>
                </Row>
              </div>
              </CanadaMap>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
});

export default MapController
