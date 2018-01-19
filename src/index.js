import PropTypes from 'prop-types';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import MotiController from './components/MotiController';
import AppController from './components/AppController';
import DualController from './components/DualController';
import TestAppController from './components/TestAppController';

import Header from './components/Header';

class App extends React.Component {
  static propTypes = {
    children: PropTypes.element,
  };

  render() {
    return (
      <div>
        <div>
          <Header />
        </div>
        <div>
          {this.props.children || <AppController ensemble_name="all_downscale_files"/>}
        </div>
      </div>
    );
  }
}

const test = true;

if (test) {
  render((
    <TestAppController/>
  ), document.getElementById('wrapper'));
} else {
  render((
    <Router history={hashHistory}>
      <Route path='/' component={App}>
        <Route path='/moti' component={MotiController} />
        <Route path='/climo/:ensemble_name' component={AppController} />
        <Route path='/compare/:ensemble_name' component={DualController} />
      </Route>
    </Router>
  ), document.getElementById('wrapper'));
}


