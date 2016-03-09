import React, { PropTypes, Component } from 'react';
import { DropdownButton, MenuItem, ButtonGroup, Button, Modal } from 'react-bootstrap';

import g from '../../core/geo';


var exportPolygon = function(key) {
  console.log(key);
  console.log(this.props.area);
  g.geojson(this.props.area).save(key);
};

var GeoExporterDropdown = React.createClass({

  propTypes: {
    area: React.PropTypes.object,
  },

  render() {
    return (
      <DropdownButton show={this.state.area} title={'Export Polygon'} onSelect={exportPolygon}>
        <MenuItem eventKey='shp'>Shapefile</MenuItem>
        <MenuItem eventKey='geojson'>GeoJSON</MenuItem>
        <MenuItem eventKey='wkt'>WKT</MenuItem>
        <MenuItem eventKey='kml'>KML</MenuItem>
        <MenuItem eventKey='gpx'>GPX</MenuItem>
      </DropdownButton>
    )
  },

});

export { GeoExporterDropdown as Dropdown };

var GeoExporterModal = React.createClass({

  propTypes: {
    area: React.PropTypes.object,
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

  render() {
    return (
      <div>

        <Button onClick={this.open}>
          Export Polygon
        </Button>

        <Modal show={this.state.showModal} onHide={this.close}>

          <Modal.Header closeButton>
            <Modal.Title>Select Format</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ButtonGroup>
              <Button onClick={exportPolygon.bind(this, 'shp')}>Shapefile</Button>
              <Button onClick={exportPolygon.bind(this, 'geojson')}>GeoJSON</Button>
              <Button onClick={exportPolygon.bind(this, 'wkt')}>WKT</Button>
              <Button onClick={exportPolygon.bind(this, 'kml')}>KML</Button>
              <Button onClick={exportPolygon.bind(this, 'gpx')}>GPX</Button>
            </ButtonGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  },

});

export { GeoExporterModal as Modal };

export default {
  Modal: GeoExporterModal,
  Dropdown: GeoExporterDropdown,
}