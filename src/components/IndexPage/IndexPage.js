import React, { PropTypes, Component } from 'react';

import classNames from 'classnames';

import Header from '../Header';
import Layout from '../PanelLayout-3vert';
import Footer from '../Footer';

import AppController from '../AppController';
import MapController from '../MapController/MapController';
import DatasetList from '../CheckboxList/DatasetList';
import GraphOverlay from '../DataGraph/GraphOverlay';
import TableOverlay from '../DataTable/TableOverlay';

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
        <div className={styles.footer}>
          <Footer />
        </div>
      </div>
    )
  }
}

export default App
