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
  setWMSParam: function(param, event) {
    var update = {}; update[param] = event.target.value;
    this.setState(update);
  },
  render: function () {
    return (
      <div>
        <div className={styles.selector}>
          <ExperimentSelector onChange={this.handleChange} />
          <select onChange={this.setWMSParam.bind(this, 'styles')} >
            <option value="boxfill/ferret">boxfill/ferret</option>
            <option value="boxfill/rainbow">boxfill/rainbow</option>
            <option value="boxfill/occam">boxfill/occam</option>
            <option value="boxfill/occam_inv">boxfill/occam_inv</option>
          </select>
          // FIXME: These need to be dynamically populated
          <select onChange={this.setWMSParam.bind(this, 'variable')} >
            <option value="tasmax">Maximumm temperature</option>
            <option value="tasmin">Minimum temperature</option>
            <option value="pr">Pricipitation</option>
          </select>
          <select onChange={this.setWMSParam.bind(this, 'logscale')} >
            <option value="false">Linear scale</option>
            <option value="true">Log scale</option>
          </select>
        </div>
        <div className={styles.map}>
        <CanadaMap {...this.state} />
        </div>
      </div>
    )
  }
});

export default MapController
