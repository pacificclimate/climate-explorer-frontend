import React, { PropTypes, Component } from 'react';
import { DropdownButton, MenuItem, ButtonGroup, Button, Modal } from 'react-bootstrap';

import g from '../../core/geo';
import ModalMixin from '../ModalMixin';


var exportPolygon = function(area, format) {
  g.geojson(area).save(format);
};

var GeoExporterDropdown = React.createClass({

  propTypes: {
    area: React.PropTypes.object,
  },

  render() {

    var boundExport = function(e, key) {
      exportPolygon(this.props.area, key);
    }.bind(this);

    return (
      <DropdownButton title={'Export Polygon'} onSelect={boundExport}>
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

  mixins: [ModalMixin],
  propTypes: {
    area: React.PropTypes.object,
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
              <Button onClick={exportPolygon.bind(this, this.props.area, 'shp')}>Shapefile</Button>
              <Button onClick={exportPolygon.bind(this, this.props.area, 'geojson')}>GeoJSON</Button>
              <Button onClick={exportPolygon.bind(this, this.props.area, 'wkt')}>WKT</Button>
              <Button onClick={exportPolygon.bind(this, this.props.area, 'kml')}>KML</Button>
              <Button onClick={exportPolygon.bind(this, this.props.area, 'gpx')}>GPX</Button>
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
