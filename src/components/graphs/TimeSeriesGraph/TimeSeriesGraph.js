import PropTypes from 'prop-types';
import React from 'react';
import { ControlLabel } from 'react-bootstrap';

import DataGraph from '../../DataGraph/DataGraph';
import styles from './TimeSeriesGraph.css';

export default class TimeSeriesGraph extends React.Component {
  static propTypes = {
    graphSpec: PropTypes.object,
  };

  render() {
    return (
      <React.Fragment>
        <DataGraph 
          data={this.props.graphSpec.data} 
          axis={this.props.graphSpec.axis} 
          tooltip={this.props.graphSpec.tooltip} 
          subchart={this.props.graphSpec.subchart} 
        />
        <ControlLabel className={styles.graphlabel}>Highlight a time span on lower graph to see more detail</ControlLabel>
      </React.Fragment>
    );
  }
}
