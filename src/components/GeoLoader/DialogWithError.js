import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, Button, Modal } from 'react-bootstrap';
import g from '../../core/geo';
import compAcontrolsB from '../../HOCs/compAcontrolsB';


export default class DialogWithError extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onLoadArea: PropTypes.func.isRequired,
  };

  A = (props) => {
    const importPolygon = (file) => {
      this.props.onHide();
      g.load(file, this.props.onLoadArea,
        () => setTimeout(props.open, 200) // Wait to avoid syling issues with Modal
      );
    };

    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>

        <Modal.Header closeButton>
          <Modal.Title>Import Polygon</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormControl
            type='file'
            label='Select file'
            onChange={(e) => importPolygon(e.currentTarget.files[0])}
          />
          <p>
            Accepts a zipped Shapefile or a single geojson Feature
            (not FeatureCollection)
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>

      </Modal>
    );
  };

  B = (props) =>
    <Modal show={props.show} onHide={props.close}>

      <Modal.Header closeButton>
        <Modal.Title>Error Importing Polygon</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Currently accepted types are single GeoJSON features and zipped
        shapefiles with a single feature.
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={props.close}>Close</Button>
      </Modal.Footer>

    </Modal>
  ;

  render() {
    const ModalControlsModal = compAcontrolsB(this.A, this.B);
    return <ModalControlsModal/>;
  }
}
