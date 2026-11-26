import PropTypes from "prop-types";
import React from "react";
import { Button, FormLabel } from "react-bootstrap";

import {
  csvButtonLabel,
  downloadGraphDataLabel,
  xslxButtonLabel,
} from "../../guidance-content/info/InformationItems.jsx";

import styles from "./ExportButtons.module.css";

export default class ExportButtons extends React.Component {
  static propTypes = {
    onExportXlsx: PropTypes.func.isRequired,
    onExportCsv: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div>
        <FormLabel className={styles.exportlabel}>
          {downloadGraphDataLabel}
        </FormLabel>
        <Button variant="light" onClick={this.props.onExportXlsx}>
          {xslxButtonLabel}
        </Button>
        <Button variant="light" onClick={this.props.onExportCsv}>
          {csvButtonLabel}
        </Button>
      </div>
    );
  }
}
