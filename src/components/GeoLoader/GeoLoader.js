import PropTypes from 'prop-types';
import React from 'react';
import { FormControl, Button, Glyphicon, Modal } from 'react-bootstrap';

import g from '../../core/geo';

/*

Provides a dialog to load a local spatial file.

Calls callback with resulting geojson

*/

// TODO: Refactor as a HOC that composes the button, modal dialog, and error
// dialog from separate components. Unfortunately we are in a bit of a hurry
// and so we use a little cut-paste instead of the deprecated mixin.
// See HOCs/buttonWithModal for a start on the HOC.

class GeoLoader extends React.Component {
  static propTypes = {
    onLoadArea: PropTypes.func.isRequired,
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      showError: false,
    };
  }

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  openError = () => {
    this.setState({ showError: true });
  };

  closeError = () =>  {
    this.setState({
      showError: false,
    });
  };

  importPolygon(file) {
    this.close();
    g.load(file, this.props.onLoadArea, function () {
      setTimeout(this.openError, 200); // Wait to avoid syling issues with Modal
    }.bind(this));
  }

  render() {
    return (
      <div>

        <Button onClick={this.openModal} title={this.props.title}>
          <Glyphicon glyph='open-file' />
        </Button>

        <Modal show={this.state.showModal} onHide={this.closeModal}>

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
            <Button onClick={this.closeModal}>Close</Button>
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

export default GeoLoader;
