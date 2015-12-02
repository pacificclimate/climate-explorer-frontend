import React, { PropTypes, Component } from 'react';
import { Input } from 'react-bootstrap';

import classNames from 'classnames';

import { CanadaMap } from '../Map/CanadaMap';
import ExperimentSelector from '../ExperimentSelector';
import Selector from '../Selector/Selector';

import styles from './MapController.css';

var MapController = React.createClass({

  getInitialState: function () {
    return {
      styles: "boxfill/ferret",
      time: "2000-01-01",
      colorscalerange: "-50,11.0",
      logscale: false
    }
  },
  getDefaultProps: function() {
    return {
      variable: "tasmax",
      dataset: "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CanESM2_historical-rcp26_r1i1p1_19500101-21001231",
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
    return (
      <div>
        <div className={styles.selector}>
          <Selector label={"Color pallette"} onChange={this.updateSelection.bind(this, 'styles')} items={['boxfill/ferret', 'boxfill/rainbow', 'boxfill/occam', 'boxfill/occam_inv']} />
          <Selector label={"Log scale?"} onChange={this.updateSelection.bind(this, 'logscale')} items={['false', 'true']} />
        </div>
        <div className={styles.map}>
        <CanadaMap {...this.state} {...this.props} onSetArea={this.handleSetArea} />
        </div>
      </div>
    )
  }
});

export default MapController
