import React, { PropTypes, Component } from 'react';
import { Input, Row, Col } from 'react-bootstrap';
import _ from 'underscore';

import classNames from 'classnames';

import { CanadaMap } from '../Map/CanadaMap';
import ExperimentSelector from '../ExperimentSelector';
import Selector from '../Selector/Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';

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

    // Find selected dataset, then apply time transformation based on index
    var selected = this.props.meta.filter(function(el){
      return el.unique_id == this.state.dataset
    }.bind(this))

    // Assumes filter returns a single element which /should/ be true. FIXME.
    this.setState({
      timeidx: timeidx,
      wmstime: selected[0].times[timeidx]})
  },

  updateDataset: function(dataset) {
    // Updates dataset in state. Updates time value to match new dataset

    var selected = this.props.meta.filter(function(el){
      return el.unique_id == dataset
    }.bind(this))[0]

    this.setState({
      dataset: dataset,
      wmstime: selected.times[this.state.timeidx]
    })
  },

  findUniqueId: function() {
    if (this.props.meta.length > 0) {
      return this.props.meta[0].unique_id;
    }
  },

  handleSetArea: function(wkt) {
    this.props.onSetArea(wkt);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      dataset: nextProps.meta[0].unique_id,
      wmstime: nextProps.meta[0].times[this.state.timeidx]
    });
  },

  render: function () {

    var pallettes = [['boxfill/ferret', 'ferret'],
                     ['boxfill/rainbow', 'rainbow'],
                     ['boxfill/occam', 'occam'],
                     ['boxfill/occam_inv', 'inverted occam']
                    ]
    var color_scales = [['false', 'Linear'], ['true', 'Logarithmic']]
    var ids = this.props.meta.map(function(el){return el.unique_id})

    return (
      <div>
        <Input>
          <Row>
            <Col lg={4} md={6}>
              <Selector label={"Color pallette"} onChange={this.updateSelection.bind(this, 'styles')} items={pallettes} />
            </Col>
            <Col lg={4} md={6}>
              <Selector label={"Color scale"} onChange={this.updateSelection.bind(this, 'logscale')} items={color_scales} />
            </Col>
            <Col lg={4} md={6}>
              <TimeOfYearSelector onChange={this.updateTime} />
            </Col>
            <Col lg={12} md={6}>
              <Selector label={"Dataset"} onChange={this.updateDataset} items={ids} />
            </Col>
          </Row>
        </Input>
        <Row>
          <Col lg={12}>
            <div className={styles.map}>
              <CanadaMap
              logscale={this.state.logscale}
              styles={this.state.styles}
              time={this.state.wmstime}
              dataset={this.state.dataset}
              variable={this.props.variable}
              onSetArea={this.handleSetArea} />
            </div>
          </Col>
        </Row>
      </div>
    )
  }
});

export default MapController
