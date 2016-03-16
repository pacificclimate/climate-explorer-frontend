import React, { Component } from 'react';
import Header from '../Header';
import AppController from '../AppController';

import styles from './IndexPage.css';

class App extends Component {

  render() {
    return (
      <div>
        <div className={styles.header}>
          <Header />
        </div>
        <div className={styles.content}>
          <AppController />
        </div>
      </div>
    );
  }
}

export default App;
