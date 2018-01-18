import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Button, Glyphicon, Modal } from 'react-bootstrap';

import _ from 'underscore';

import './MapSettings.css';
import compAcontrolsB from '../../HOCs/compAcontrolsB';


export default class MapSettings extends React.Component {
  static propTypes = {
    title: PropTypes.string,
  };

  A = (props) =>
    <Button onClick={props.open} title={this.props.title}>
      <Glyphicon glyph='menu-hamburger'/>
    </Button>
  ;


  B = (props) =>
    <Modal show={props.show} onHide={props.close} >

      <Modal.Header closeButton>
        <Modal.Title>Map Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Grid>
          <Row>
            datasetSelector
          </Row>
          <Row>
            rasterControls
            linkControls
            isolineControls
          </Row>
        </Grid>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={props.close}>Close</Button>
      </Modal.Footer>

    </Modal>
  ;

  render() {
    const ButtonWithModal = compAcontrolsB(this.A, this.B);
    return <ButtonWithModal/>;
  }
}
