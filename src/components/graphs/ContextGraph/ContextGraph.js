import PropTypes from 'prop-types';
import React from 'react';

import DataGraph from '../../DataGraph/DataGraph';


export default class ContextGraph extends React.Component {
  static propTypes = {
    graphSpec: PropTypes.object,
  };

  render() {
    return (
      <DataGraph
        data={this.props.graphSpec.data}
        axis={this.props.graphSpec.axis}
        legend={this.props.graphSpec.legend}
        line={this.props.graphSpec.line}
        tooltip={this.props.graphSpec.tooltip}
      />
    );
  }
}
