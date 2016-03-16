import React, { PropTypes, Component } from 'react';

import classNames from 'classnames';

import Header from '../Header';
import Footer from '../Footer';

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
    )
  }
}

export default App
