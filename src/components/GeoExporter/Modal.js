import PropTypes from 'prop-types';
import React from 'react';
import { ButtonGroup, Button, Glyphicon, Modal } from 'react-bootstrap';

import g from '../../core/geo';
import buttonWithModal from "../../HOCs/buttonWithModal";


var exportPolygon = function (area, format) {
  // this.closeModal();
  g.geojson(area).save(format);
};


class GeoExporterModal extends React.Component {
  static propTypes = {
    area: PropTypes.object,
    title: PropTypes.string,
  };

  ButtonBody = () => <Glyphicon glyph='save-file'/>;

  // TODO: Tighten this rubbish up. Good grief.
  exportShapefile = () => exportPolygon.bind(this, this.props.area, 'shp')();
  exportGeoJSON = () => exportPolygon.bind(this, this.props.area, 'geojson')();
  exportWKT = () => exportPolygon.bind(this, this.props.area, 'wkt')();
  exportKML = () => exportPolygon.bind(this, this.props.area, 'kml')();
  exportGPX = () => exportPolygon.bind(this, this.props.area, 'gpx')();

  ModalBody = () => <div>
    <Modal.Header closeButton>
      <Modal.Title>Export Polygon by Type</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <ButtonGroup>
        <Button onClick={this.exportShapefile}>Shapefile</Button>
        <Button onClick={this.exportGeoJSON}>GeoJSON</Button>
        <Button onClick={this.exportWKT}>WKT</Button>
        <Button onClick={this.exportKML}>KML</Button>
        <Button onClick={this.exportGPX}>GPX</Button>
      </ButtonGroup>
    </Modal.Body>
  </div>;

  render() {
    const ButtonWithModal = buttonWithModal(
      this.ButtonBody,
      this.ModalBody,
    );
    return <ButtonWithModal/>;
  }
}

export default GeoExporterModal;
