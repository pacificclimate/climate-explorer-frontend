import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import './TestApp.css';
import TestMapController from '../TestMapController';


class TestApp extends React.Component {
  constructor(props) {
    super(props);

    // Set up test state.
    this.state = {
      meta: [{}],  // meta.length > 0 suffices for now
      comparandMeta: undefined,
      area: undefined,
      // area: {"type":"Feature","properties":{"source":"PCIC Climate Explorer"},"geometry":{"type":"Polygon","coordinates":[[[-120.117187,68.027344],[-110.449219,64.707031],[-119.53125,62.070312],[-120.117187,68.027344]]]}}, // works as expected
    };
  }

  handleSetArea = (area) => {
    console.log('handleSetArea', JSON.stringify(area, 2));
    this.setState({ area });
  };

  render() {
    return (
      <TestMapController
        meta={this.state.meta}
        comparandMeta={this.state.comparandMeta}
        area={this.state.area}
        onSetArea={this.handleSetArea}
      />
    );
  }
}

export default TestApp;
