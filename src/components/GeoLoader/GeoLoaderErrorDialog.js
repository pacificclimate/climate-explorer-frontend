import PropTypes from 'prop-types';
import React from 'react';
import { Button, Modal } from 'react-bootstrap';


export default class GeoloaderErrorDialog extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
  };

  render() {
    return (
        <Modal show={this.props.show} onHide={this.props.close}>

        <Modal.Header closeButton>
          <Modal.Title>Error Importing Polygon</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Currently accepted types are single GeoJSON features and zipped
          shapefiles with a single feature.
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.close}>Close</Button>
        </Modal.Footer>

      </Modal>
    );
  }
}
