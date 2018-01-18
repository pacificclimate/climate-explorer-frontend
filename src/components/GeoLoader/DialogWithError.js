import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, Button, Modal } from 'react-bootstrap';
import g from "../../core/geo";


export default class DialogWithError extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onLoadArea: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showError: false,
    };
  }

  openError = () => {
    this.setState({ showError: true });
  };

  closeError = () =>  {
    this.setState({ showError: false });
  };

  importPolygon = (file) => {
    this.props.onHide();
    g.load(file, this.props.onLoadArea, function () {
      setTimeout(this.openError, 200); // Wait to avoid syling issues with Modal
    }.bind(this));
  };

  render() {
    return (
      <div>
        <Modal show={this.props.show} onHide={this.props.onHide}>

          <Modal.Header closeButton>
            <Modal.Title>Import Polygon</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FormControl
              type='file'
              label='Select file'
              onChange={function (e) {
                this.importPolygon(e.currentTarget.files[0]);
              }.bind(this)}
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

        <Modal show={this.state.showError} onHide={this.closeError}>

          <Modal.Header closeButton>
            <Modal.Title>Error Importing Polygon</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Currently accepted types are single GeoJSON features and zipped
            shapefiles with a single feature.
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.closeError}>Close</Button>
          </Modal.Footer>

        </Modal>

      </div>
    );
  }
}
