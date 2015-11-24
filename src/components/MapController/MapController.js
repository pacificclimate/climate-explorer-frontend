import React, { PropTypes, Component } from 'react';

import classNames from 'classnames';

import { CanadaMap } from '../Map/CanadaMap';
import ExperimentSelector from '../ExperimentSelector';


import styles from './MapController.css';

var MapController = React.createClass({

  getInitialState: function () {
    return {
      dataset: "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CanESM2_historical-rcp26_r1i1p1_19500101-21001231",
      variable: "tasmax",
      styles: "boxfill/ferret",
      time: "2000-01-01",
      colorscalerange: "-50,11.0",
      logscale: false
    }
  },
  handleChange: function(i) {
    this.setState({
      variable: 'pr',
      logscale: true,
      colorscalerange: "0.1,100.0"
    });
  },
    
  render: function () {
    return (
      <div>
        <div className={styles.selector}>
          <ExperimentSelector onChange={this.handleChange} />
        </div>
        <div className={styles.map}>
        <CanadaMap {...this.state} />
        </div>
      </div>
    )
  }
});

export default MapController
