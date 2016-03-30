import React, { Component } from 'react';
import Header from '../Header';
import MotiController from '../MotiController';

class App extends Component {

  render() {
    return (
      <div>
        <div>
          <Header />
        </div>
        <div>
          <MotiController />
        </div>
      </div>
    );
  }
}

export default App;
