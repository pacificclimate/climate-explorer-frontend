import React, { Component } from 'react';
var ReactDOM = require('react-dom');

import MotiApp from './components/MotiApp';

class App extends Component {

    render() {
      return (
            <MotiApp />
        );
    }
}

ReactDOM.render(<App />, document.getElementById('wrapper'));
