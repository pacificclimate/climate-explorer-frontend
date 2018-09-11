import PropTypes from 'prop-types';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import DataTool from './components/DataTool';

class App extends React.Component {
  static propTypes = {
    children: PropTypes.element,
  };

  constructor(props) {
    super(props);
    this.state = {
      dataPath: '/data/climo/ce_files',
    };
  }

  handleNavigate = key => {
    this.setState({ dataPath: key });
  }

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
            <Route path='/data' render={
                props => <DataTool
                  {...props}
                  defaultPath={this.state.dataPath}
                  onNavigate={this.handleNavigate}
                />
              }
            />
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
