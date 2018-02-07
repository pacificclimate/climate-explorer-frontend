import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';
import _ from 'underscore';

import DatasetSelector from './DatasetSelector';
import DataDisplayControls from './DataDisplayControls';
import TimeLinkButton from './TimeLinkButton';


const layerPropTypes = PropTypes.shape({
  times: PropTypes.object,
  timeIdx: PropTypes.string,
  palette: PropTypes.string,
  range: PropTypes.object,
  logscale: PropTypes.string,
  onChangeTime: PropTypes.func.isRequired,
  onChangePalette: PropTypes.func.isRequired,
  onChangeScale: PropTypes.func.isRequired,
});

export default class MapSettingsDialog extends React.Component {
  static propTypes = {
    // props for controlling dialog visibility
    show: PropTypes.bool.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,

    title: PropTypes.string,
    // TODO: Refactor according to comments in DatasetSelector
    meta: PropTypes.array.isRequired,
    comparandMeta: PropTypes.array,

    dataset: PropTypes.string,  // current dataset selection, encoded as JSON string
    onDatasetChange: PropTypes.func.isRequired,  // callback, arg is enocded JSON string

    raster: layerPropTypes.isRequired,

    hasComparand: PropTypes.bool,
    timesLinkable: PropTypes.bool,
    isoline: layerPropTypes,
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
      this.props.isoline.onChangeTime(this.props.raster.timeIdx);
    }
    this.setState({ linkTimes: toggledlinkTimes });
  };

  handleChangeVariableTime = (time) => {
    this.props.raster.onChangeTime(time);
    if (this.state.linkTimes) {
      this.props.isoline.onChangeTime(time);
    }
  };

  handleChangeComparandTime = (time) => {
    if (!this.state.linkTimes) {
      this.props.isoline.onChangeTime(time);
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
                  {..._.omit(this.props.raster, 'onChangeTime')}
                  onChangeTime={this.handleChangeVariableTime}
                />
              </Col>
              {
                this.props.hasComparand &&
                <Col lg={1}>
                  <TimeLinkButton
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
                    timeLinked={this.state.linkTimes}
                    {..._.omit(this.props.isoline, 'onChangeTime')}
                    onChangeTime={this.handleChangeComparandTime}
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
