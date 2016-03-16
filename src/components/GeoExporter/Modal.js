import React from 'react';
import { ButtonGroup, Button, Glyphicon, Modal } from 'react-bootstrap';

import g from '../../core/geo';
import ModalMixin from '../ModalMixin';

var exportPolygon = function (area, format) {
  this.close();
  g.geojson(area).save(format);
};

var GeoExporterModal = React.createClass({

  propTypes: {
    area: React.PropTypes.object,
    title: React.PropTypes.string,
  },

  mixins: [ModalMixin],

  render() {
    return (
      <div>

        <Button onClick={this.open} title={this.props.title}><Glyphicon glyph='save-file' /></Button>

        <Modal show={this.state.showModal} onHide={this.close}>

          <Modal.Header closeButton>
            <Modal.Title>Export Polygon by Type</Modal.Title>
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

export default GeoExporterModal;
