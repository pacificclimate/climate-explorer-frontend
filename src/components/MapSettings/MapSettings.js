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
    comparandMeta: PropTypes.array,

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

    rasterLayerMin: PropTypes.number,
    rasterLogscale: PropTypes.string,
    onChangeRasterScale: PropTypes.func.isRequired,

    isolineLayerMin: PropTypes.number,
    isolineLogscale: PropTypes.string,
    onChangeIsolineScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      linkTimes: false,  // Under control of LinkControls
    };
  }

  variableId(meta) {
    return meta.length > 0 && meta[0].variable_id;
  }

  rasterVariableId() {
    return this.variableId(this.props.meta);
  }

  isolineVariableId() {
    return this.variableId(this.props.comparandMeta);
  }

  toggleLinkTimes = () => {
    this.setState({ linkTimes: !this.state.linkTimes });
  };

  handleChangeVariableTime = (time) => {
    this.props.onChangeVariableTime(time);
    if (this.state.linkTimes) {
      this.props.onChangeComparandTime(time);
    }
  };

  handleChangeComparandTime = (time) => {
    if (!this.state.linkTimes) {
      this.props.onChangeComparandTime(time);
    }
  };

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
                onChangeTime={this.handleChangeVariableTime}
                palette={this.props.rasterPalette}
                onChangePalette={this.props.onChangeRasterPalette}
                variableId={this.rasterVariableId()}
                layerMin={this.props.rasterLayerMin}
                logscale={this.props.rasterLogscale}
                onChangeScale={this.props.onChangeRasterScale}
              />
            </Col>
            {
              this.props.hasComparand &&
              <Col lg={1}>
                <LinkControls
                  active={this.state.linkTimes}
                  onClick={this.toggleLinkTimes}
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
                  onChangeTime={this.handleChangeComparandTime}
                  palette={this.props.isolinePalette}
                  onChangePalette={this.props.onChangeIsolinePalette}
                  layerMin={this.props.isolineLayerMin}
                  logscale={this.props.isolineLogscale}
                  onChangeScale={this.props.onChangeIsolineScale}
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
