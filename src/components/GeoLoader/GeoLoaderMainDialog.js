import PropTypes from 'prop-types';
import React from 'react';
import { FormControl, Button, Modal } from 'react-bootstrap';

import g from '../../core/geo';


export default class GeoloaderMainDialog extends React.Component {
  // Note slightly tricky bit needed to chain A-controls-B components:
  // This main dialog controls the error dialog. The error dialog's control
  // props are the local ones. The control props for this (main) dialog are
  // those of its parent (the button). We access those via the `controls`
  // prop, specifically `controls[1]`, for the immediate parents.
  static propTypes = {
    show: PropTypes.bool,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    controls: PropTypes.array,

    onLoadArea: PropTypes.func.isRequired,
  };

  importPolygon = (file) => {
    // Close the main dialog.
    this.props.controls[1].close();
    // Open the error dialog on fail.
    g.load(file, this.props.onLoadArea, this.props.open);
  };

  render() {
    return (
      <Modal show={this.props.controls[1].show()}>
  
        <Modal.Header closeButton>
          <Modal.Title>Import Polygon</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <p>
            <FormControl
              type='file'
              label='Select file'
              onChange={(e) => this.importPolygon(e.currentTarget.files[0])}
            />
          </p>
          <p>
            We recommend importing only a file containing a
            single Feature (not a FeatureCollection).
          </p>
          <p>
            If you import a file containing multiple features,
            only the first feature (in the internal order within the file)
            will become active and be used to form spatial averages.
            The active feature is coloured blue.
            Inactive features are coloured grey.
          </p>
        </Modal.Body>
  
        <Modal.Footer>
          <Button onClick={this.props.controls[1].close}>Close</Button>
        </Modal.Footer>
  
      </Modal>
    );
  }
}
