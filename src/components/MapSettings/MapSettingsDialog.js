import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';

import DatasetSelector from './DatasetSelector';
import DataDisplayControls from './DataDisplayControls';
import LinkControls from './LinkControls';


export default class MapSettingsDialog extends React.Component {
  static propTypes = {
    // props for controlling dialog visibility
    show: PropTypes.bool.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,

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

    timesLinkable: PropTypes.bool,

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
      linkTimes: this.props.timesLinkable,
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
    const toggledlinkTimes = !this.state.linkTimes;
    if (toggledlinkTimes) {
      this.props.onChangeComparandTime(this.props.variableTimeIdx);
    }
    this.setState({ linkTimes: toggledlinkTimes });
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

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.close}>

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
                    timesLinkable={this.props.timesLinkable}
                    linkTimes={this.state.linkTimes}
                    onClick={this.toggleLinkTimes}
                  />
                </Col>
              }
              {
                this.props.hasComparand &&
                <Col lg={5}>
                  <DataDisplayControls
                    name='Isoline'
                    times={this.props.comparandTimes}
                    timeIdx={this.props.comparandTimeIdx}
                    timeLinked={this.state.linkTimes}
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
          <Button onClick={this.props.close}>Close</Button>
        </Modal.Footer>

      </Modal>
    );    
  }
}
