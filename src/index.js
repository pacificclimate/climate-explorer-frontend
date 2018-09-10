import PropTypes from 'prop-types';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

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
    // We have to set Router basename with the hash (#) in it to enable navigating
    // into a specific path from outside the app.
    return (
      <Router basename={'/#'}>
        <div>
          <div>
            <Header />
          </div>
          <div>
            <Route exact path='/' render={() => (<Redirect to='/data'/>)} />
            <Route exact path='/data' render={() => (<Redirect to='/data/climo/ce_files'/>)} />
            <Route path='/data/moti' component={MotiAppController} />
            <Route path='/data/climo/:ensemble_name' component={SingleAppController} />
            <Route path='/data/compare/:ensemble_name' component={DualAppController} />
            <Route path='/data/precipitation/:ensemble_name' component={PrecipAppController} />
          </div>
          <div>
            <Footer />
          </div>
        </div>
      </Router>
    );
  }
}

render(<App/>, document.getElementById('wrapper'));
