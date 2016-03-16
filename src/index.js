import React, { Component } from 'react';
var ReactDOM = require('react-dom');

import IndexPage from './components/IndexPage';

class App extends Component {

    render() {
      return (
            <IndexPage />
        );
    }
}

ReactDOM.render(<App />, document.getElementById('wrapper'));
