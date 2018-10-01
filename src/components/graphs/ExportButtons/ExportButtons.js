import PropTypes from 'prop-types';
import React from 'react';
import { Button, ControlLabel } from 'react-bootstrap';

import styles from './ExportButtons.css';
import { downloadDataLabel } from '../../guidance-content/info/InformationItems';


export default class ExportButtons extends React.Component {
  static propTypes = {
    onExportXlsx: PropTypes.func.isRequired,
    onExportCsv: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div>
        <ControlLabel className={styles.exportlabel}>
          {downloadDataLabel}
        </ControlLabel>
        <Button onClick={this.props.onExportXlsx}>XLSX</Button>
        <Button onClick={this.props.onExportCsv}>CSV</Button>
      </div>
    );
  }
}
