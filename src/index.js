import PropTypes from 'prop-types';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import MotiController from './components/MotiController';
import AppController from './components/AppController';
import DualController from './components/DualController';
import PrecipitationController from './components/PrecipitationController';

import Header from './components/Header';
import Footer from './components/Footer';

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
        <div>
          <Footer />
        </div>
      </div>
    );
  }
}

render((
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <Route path='/moti' component={MotiController} />
      <Route path='/climo/:ensemble_name' component={AppController} />
      <Route path='/compare/:ensemble_name' component={DualController} />
      <Route path='/precipitation/:ensemble_name' component={PrecipitationController} />
    </Route>
  </Router>
), document.getElementById('wrapper'));


