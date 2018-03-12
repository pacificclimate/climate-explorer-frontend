import PropTypes from 'prop-types';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import SingleAppController from './components/app-controllers/SingleAppController';
import DualAppController from './components/app-controllers/DualAppController';
import MotiAppController from './components/app-controllers/MotiAppController';
import PrecipAppController from './components/app-controllers/PrecipAppController';

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
      <Route path='/moti' component={MotiAppController} />
      <Route path='/climo/:ensemble_name' component={SingleAppController} />
      <Route path='/compare/:ensemble_name' component={DualAppController} />
      <Route path='/precipitation/:ensemble_name' component={PrecipAppController} />
    </Route>
  </Router>
), document.getElementById('wrapper'));


