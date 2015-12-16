import React, { PropTypes, Component } from 'react';
import { Input, Row, Col } from 'react-bootstrap';

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

  getInitialState: function () {
    return {
      styles: "boxfill/ferret",
      time: "2055-01-16T00:00:00.000Z",
      dataset: "tasmax_Amon_CanESM2_rcp85_r1i1p1_20400101-20691231",
      logscale: false
    }
  },
  getDefaultProps: function() {
    return {
      variable: "tasmax",
      meta: []
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
    this.setState({time: selected[0].times[timeidx]})
  },

  findUniqueId: function() {
    if (this.props.meta.length > 0) {
      return this.props.meta[0].unique_id;
    }
  },

  handleSetArea: function(wkt) {
    this.props.onSetArea(wkt);
  },

  render: function () {
    console.log(this.state);

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
            <Col lg={3} md={6}>
              <Selector label={"Color pallette"} onChange={this.updateSelection.bind(this, 'styles')} items={pallettes} />
            </Col>
            <Col lg={3} md={6}>
              <Selector label={"Color scale"} onChange={this.updateSelection.bind(this, 'logscale')} items={color_scales} />
            </Col>
            <Col lg={3} md={6}>
              <TimeOfYearSelector onChange={this.updateTime} />
            </Col>
            <Col lg={3} md={6}>
              <Selector label={"Dataset"} onChange={this.updateSelection.bind(this, 'dataset')} items={ids} />
            </Col>
          </Row>
        </Input>
        <Row>
          <Col lg={12}>
            <div className={styles.map}>
              <CanadaMap
                logscale={this.state.logscale}
                styles={this.state.styles}
                time={this.state.time}
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
