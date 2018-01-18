import PropTypes from 'prop-types';
import React from 'react';
import { ButtonGroup, Button, Glyphicon, Modal } from 'react-bootstrap';

import g from '../../core/geo';
import compAcontrolsB from '../../HOCs/compAcontrolsB';


var exportPolygon = function (area, format, close) {
  close();
  g.geojson(area).save(format);
};


export default class GeoExporterModal extends React.Component {
  // This class composes the button content with the modal content using
  // the HOC `compAcontrolsB`. Doing this was instructive; it's not quite
  // as simple as it might seem. For details, the documentation in
  // `compAcontrolsB`.

  static propTypes = {
    area: PropTypes.object,
    title: PropTypes.string,
  };

  A = (props) =>
    <Button onClick={props.open}>
      <Glyphicon glyph='save-file'/>
    </Button>
  ;


  B = (props) => {
    // TODO: Create these by mapping over file type. Not so easy as it seems.
    const exportShapefile =
      exportPolygon.bind(this, this.props.area, 'shp', props.close);
    const exportGeoJSON =
      exportPolygon.bind(this, this.props.area, 'geojson', props.close);
    const exportWKT =
      exportPolygon.bind(this, this.props.area, 'wkt', props.close);
    const exportKML =
      exportPolygon.bind(this, this.props.area, 'kml', props.close);
    const exportGPX =
      exportPolygon.bind(this, this.props.area, 'gpx', props.close);

    return (
      <Modal show={props.show} onHide={props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Export Polygon by Type</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ButtonGroup>
            <Button onClick={exportShapefile}>Shapefile</Button>
            <Button onClick={exportGeoJSON}>GeoJSON</Button>
            <Button onClick={exportWKT}>WKT</Button>
            <Button onClick={exportKML}>KML</Button>
            <Button onClick={exportGPX}>GPX</Button>
          </ButtonGroup>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={props.close}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  render() {
    const ButtonWithModal = compAcontrolsB(this.A, this.B);
    return <ButtonWithModal/>;
  }
}
