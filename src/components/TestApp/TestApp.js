import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import './TestApp.css';
import TestMapController from '../TestMapController';


class TestApp extends React.Component {

  render() {
    return (
      <TestMapController/>
    );
  }
}

export default TestApp;
