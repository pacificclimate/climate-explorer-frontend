import PropTypes from 'prop-types';
import React from 'react';
import { ButtonGroup, Button, Glyphicon, Modal } from 'react-bootstrap';

import g from '../../core/geo';


var exportPolygon = function (area, format) {
  this.closeModal();
  g.geojson(area).save(format);
};


class GeoExporterModal extends React.Component {
  static propTypes = {
    area: PropTypes.object,
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
    };
  }

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    return (
      <div>

        <Button onClick={this.openModal} title={this.props.title}><Glyphicon glyph='save-file' /></Button>

        <Modal show={this.state.showModal} onHide={this.closeModal}>

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
            <Button onClick={this.closeModal}>Close</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  }
}

export default GeoExporterModal;
