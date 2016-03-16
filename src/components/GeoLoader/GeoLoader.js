import React from 'react';
import { Input, Button, Glyphicon, Modal } from 'react-bootstrap';

import g from '../../core/geo';
import ModalMixin from '../ModalMixin';

/*

Provides a dialog to load a local spatial file.

Calls callback with resulting geojson

*/

var GeoLoader = React.createClass({

  propTypes: {
    onLoadArea: React.PropTypes.func.isRequired,
    title: React.PropTypes.string,
  },

  mixins: [ModalMixin],

  importError: function () {
    this.setState({
      showError: true,
    });
  },

  closeError: function () {
    this.setState({
      showError: false,
    });
  },

  importPolygon: function (file) {
    this.close();
    g.load(file, this.props.onLoadArea, function () {
      setTimeout(this.importError, 200); // Wait to avoid syling issues with Modal
    }.bind(this));
  },

  render: function () {
    return (
      <div>

        <Button onClick={this.open} title={this.props.title}>
          <Glyphicon glyph='open-file' />
        </Button>

        <Modal show={this.state.showModal} onHide={this.close}>

          <Modal.Header closeButton>
            <Modal.Title>Import Polygon</Modal.Title>
          </Modal.Header>

          <Modal.Body>

            <Input type='file'
              label='Select file'
              help='Accepts a zipped Shapefile or a single geojson Feature (not FeatureCollection)'
              onChange={function (e) {
                this.importPolygon(e.currentTarget.files[0]);
              }.bind(this)}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>

        </Modal>

        <Modal show={this.state.showError} onHide={this.closeError}>

          <Modal.Header closeButton>
            <Modal.Title>Error Importing Polygon</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Currently accepted types are single GeoJSON features and zipped shapefiles with a single feature.
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.closeError}>Close</Button>
          </Modal.Footer>

        </Modal>

      </div>
    );
  },

});

export default GeoLoader;
