import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';


export default class ScaleSelector extends React.Component {
  static propTypes = {
    name: PropTypes.string, // 'Raster' | 'Isoline'
  };

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div>{this.props.name} Scale Selector</div>
    );
  }
}