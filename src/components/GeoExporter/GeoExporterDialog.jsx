import PropTypes from "prop-types";
import React from "react";
import { ButtonGroup, Button, Modal } from "react-bootstrap";

import g from "../../core/geo";

export default class GeoExporterDialog extends React.Component {
  static propTypes = {
    // props for controlling dialog visibility
    show: PropTypes.bool.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,

    area: PropTypes.object,
    title: PropTypes.string,
  };

  exportPolygon(format) {
    this.props.close();
    g.geojson(this.props.area).save(format);
  }

  // TODO: Create these by mapping over file type. Not so easy as it seems.
  exportShapefile = this.exportPolygon.bind(this, "shp");
  exportGeoJSON = this.exportPolygon.bind(this, "geojson");
  exportWKT = this.exportPolygon.bind(this, "wkt");
  exportKML = this.exportPolygon.bind(this, "kml");
  exportGPX = this.exportPolygon.bind(this, "gpx");

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.close}>
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

        <Modal.Footer>
          <Button onClick={this.props.close}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
