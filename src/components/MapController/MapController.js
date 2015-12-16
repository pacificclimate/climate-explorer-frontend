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
        dataset: React.PropTypes.string,
        variable: React.PropTypes.string,
        meta: React.PropTypes.array,
        onSetArea: React.PropTypes.func.isRequired,
    },

  getInitialState: function () {
    return {
      styles: "boxfill/ferret",
      time: "2055-01-16T00:00:00.000Z",
      logscale: false
    }
  },
  getDefaultProps: function() {
    return {
      variable: "tasmax",
      dataset: "tasmax_Amon_CanESM2_rcp85_r1i1p1_20400101-20691231",
    }
  },

  updateSelection: function(param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  handleSetArea: function(wkt) {
    // TODO: Do something more here?
    // Really just here so it's not invisibly transferred from parent props, not directly needed
    this.props.onSetArea(wkt);
  },

  render: function () {

    var pallettes = [['boxfill/ferret', 'ferret'],
                     ['boxfill/rainbow', 'rainbow'],
                     ['boxfill/occam', 'occam'],
                     ['boxfill/occam_inv', 'inverted occam']
                    ]
    var color_scales = [['false', 'Linear'], ['true', 'Logarithmic']]

    return (
      <div>
        <Input>
          <Row>
            <Col lg={4} md={4}>
              <Selector label={"Color pallette"} onChange={this.updateSelection.bind(this, 'styles')} items={pallettes} />
            </Col>
            <Col lg={4} md={4}>
              <Selector label={"Color scale"} onChange={this.updateSelection.bind(this, 'logscale')} items={color_scales} />
            </Col>
            <Col lg={4} md={4}>
              <TimeOfYearSelector onChange={this.updateSelection.bind(this, 'time')} />
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
                dataset={this.props.dataset}
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
