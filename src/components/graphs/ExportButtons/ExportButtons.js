import PropTypes from "prop-types";
import React from "react";
import { Button, ControlLabel } from "react-bootstrap";

import {
  csvButtonLabel,
  downloadGraphDataLabel,
  xslxButtonLabel,
} from "../../guidance-content/info/InformationItems";

import styles from "./ExportButtons.module.css";

export default class ExportButtons extends React.Component {
  static propTypes = {
    onExportXlsx: PropTypes.func.isRequired,
    onExportCsv: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  render() {
    return (
      <div>
        <ControlLabel className={styles.exportlabel}>
          {downloadGraphDataLabel}
        </ControlLabel>
        <Button
          disabled={this.props.disabled}
          onClick={this.props.onExportXlsx}
        >
          {xslxButtonLabel}
        </Button>
        <Button disabled={this.props.disabled} onClick={this.props.onExportCsv}>
          {csvButtonLabel}
        </Button>
      </div>
    );
  }
}
