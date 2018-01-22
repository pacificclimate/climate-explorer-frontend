import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Button, Glyphicon, Modal } from 'react-bootstrap';

import './MapSettings.css';
import compAcontrolsB from '../../HOCs/compAcontrolsB';
import DatasetSelector from './DatasetSelector';
import DataDisplayControls from './DataDisplayControls';
import LinkControls from './LinkControls';


export default class MapSettings extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    // TODO: Refactor according to comments in DatasetSelector
    meta: PropTypes.array,

    dataset: PropTypes.string,  // current dataset selection, encoded as JSON string
    onDatasetChange: PropTypes.func.isRequired,  // callback, arg is enocded JSON string

    variableTimes: PropTypes.object,
    variableTimeIdx: PropTypes.string,
    onChangeVariableTime: PropTypes.func.isRequired,

    hasComparand: PropTypes.bool,
    comparandTimes: PropTypes.object,
    comparandTimeIdx: PropTypes.string,
    onChangeComparandTime: PropTypes.func.isRequired, // required???

    rasterPalette: PropTypes.string,
    onChangeRasterPalette: PropTypes.func.isRequired,

    isolinePalette: PropTypes.string,
    onChangeIsolinePalette: PropTypes.func.isRequired, // required???
  };

  constructor(props) {
    super(props);

    this.state = {
      linkTimes: false,  // Under control of LinkControls
    };
  }

  handleLinkTimes = linkTimes => this.setState({ linkTimes });

  MapSettingsButton = (props) =>
    <Button onClick={props.open} title={this.props.title}>
      <Glyphicon glyph='menu-hamburger'/>
    </Button>
  ;

  MapSettingsDialog = (props) =>
    <Modal show={props.show} onHide={props.close} >

      <Modal.Header closeButton>
        <Modal.Title>Map Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Grid fluid>
          <Row>
            <Col lg={12}>
              <DatasetSelector
                meta={this.props.meta}
                value={this.props.dataset}
                onChange={this.props.onDatasetChange}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={this.props.hasComparand ? 6 : 12}>
              <DataDisplayControls
                name='Raster'
                times={this.props.variableTimes}
                timeIdx={this.props.variableTimeIdx}
                onChangeTime={this.props.onChangeVariableTime}
                palette={this.props.rasterPalette}
                onChangePalette={this.props.onChangeRasterPalette}
              />
            </Col>
            {
              this.props.hasComparand &&
              <Col lg={1}>
                <LinkControls
                  value={this.state.linkTimes}
                  onChange={this.handleLinkTimes}
                />
              </Col>
            }
            {
              this.props.hasComparand &&
              <Col lg={5}>
                <DataDisplayControls
                  name='Isoline'
                  disabled={this.state.linkTimes}
                  times={this.props.comparandTimes}
                  timeIdx={this.props.comparandTimeIdx}
                  onChangeTime={this.props.onChangeComparandTime}
                  palette={this.props.isolinePalette}
                  onChangePalette={this.props.onChangeIsolinePalette}
                />
              </Col>
            }
          </Row>
        </Grid>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={props.close}>Close</Button>
      </Modal.Footer>

    </Modal>
  ;

  render() {
    const ButtonWithDialog = compAcontrolsB(
      this.MapSettingsButton,
      this.MapSettingsDialog
    );
    return <ButtonWithDialog/>;
  }
}
