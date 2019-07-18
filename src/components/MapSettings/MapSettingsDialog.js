import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';
import _ from 'lodash';

import DataSpecSelector from '../DataSpecSelector/DataSpecSelector';
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

// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
export default class MapSettingsDialog extends React.Component {
  static propTypes = {
    // props for controlling dialog visibility
    show: PropTypes.bool.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,

    title: PropTypes.string,
    meta: PropTypes.array.isRequired,
    comparandMeta: PropTypes.array,

    dataSpec: PropTypes.string,  // current dataSpec (run + period) selection, encoded as JSON string
    onDataSpecChange: PropTypes.func.isRequired,  // callback, arg is enocded JSON string

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
    const rasterColLg = this.props.hasComparand ? 6 : 12;

    return (
      <Modal show={this.props.show} onHide={this.props.close}>

        <Modal.Header closeButton>
          <Modal.Title>Map Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Grid fluid>
            <Row>
              <Col lg={12}>
                <DataSpecSelector
                  meta={this.props.meta}
                  value={this.props.dataSpec}
                  onChange={this.props.onDataSpecChange}
                />
              </Col>
            </Row>

            <Row>
              <Col lg={rasterColLg}>
                <h4>Raster</h4>
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
                  <h4>Isolines</h4>
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
