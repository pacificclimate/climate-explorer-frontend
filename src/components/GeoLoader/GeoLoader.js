import React, { PropTypes, Component } from 'react';
import { Input, Button, Modal } from 'react-bootstrap';

import g from '../../core/geo';

/*

Provides a dialog to load a local spatial file.

Calls callback with resulting geojson

*/

var GeoLoader = React.createClass({

  propTypes: {
    onLoadArea: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  close() {
    this.setState({
      showModal: false
    });
  },

  open() {
    this.setState({
      showModal: true
    });
  },

  importPolygon: function(file) {
    this.close();
    g.load(file, this.props.onLoadArea);
  },

  render: function () {
    return (
      <div>

        <Button onClick={this.open}>
          Import Polygon
        </Button>

        <Modal show={this.state.showModal} onHide={this.close}>

          <Modal.Header closeButton>
            <Modal.Title>Import Polygon by Type</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Input type='file'
              label='GeoJSON File'
              help='File containing a single polygon'
              onChange={function(e) {
                this.importPolygon(e.currentTarget.files[0])
              }.bind(this)}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  },

});

export default GeoLoader;
