import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Button, Glyphicon } from 'react-bootstrap';

import _ from 'underscore';

import InputRange from 'react-input-range';

import StaticControl from '../StaticControl';

import './LayerOpacityControl.css';

export default class LayerOpacityControl extends PureComponent {
  static propTypes = {
    layerOpacity: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showControls: false,
      layerState: _.mapObject(props.layerOpacity, () => ({
        visible: true,
        prevOpacity: 0,
      })),
      allLayersVisible: true,
    };
  }

  handleMouseEnter = () => this.setState({ showControls: true });
  handleMouseLeave = () => this.setState({ showControls: false });

  changeLayerVisibility = (layerType, visible) => {
    // Change specified layer's visibility.
    //
    // If `visible` has a Boolean value, change visibility accordingly.
    // Otherwise, toggle visibility.
    //
    // If no visibility change, do nothing.
    // If hiding layer, save its current opacity, then set its opacity to 0.
    // If showing layer, restore its saved opacity.
    //
    // Update the all-layers toggling state if we go to all hidden
    // or all visible.

    const nextVisible = _.isBoolean(visible) ?
      visible : !this.state.layerState[layerType].visible;
    const change = nextVisible !== this.state.layerState[layerType].visible;

    if (!change) {
      return;
    }

    const currentOpacity = this.props.layerOpacity[layerType];

    // Update layer opacity according to next visibility.
    this.props.onChange(
      layerType,
      nextVisible ? this.state.layerState[layerType].prevOpacity : 0
    );

    // Update layer's visibility state: Set visibility flag to next visibility,
    // store current opacity for restoration later.

    this.setState(prevState => {
      const layerState = {
        ...prevState.layerState,
        [layerType]: {
          visible: nextVisible,
          prevOpacity: currentOpacity,
        },
      };

      // If we're now showing all layers, change all-layers toggling accordingly
      if (_.every(layerState, 'visible')) {
        return { layerState, allLayersVisible: true };
      }

      // If we're now hiding all layers, change all-layers toggling accordingly
      if (!_.some(layerState, 'visible')) {
        return { layerState, allLayersVisible: false };
      }

      // Otherwise don't mess with the all-layers toggling state
      return { layerState };
    });
  };

  toggleAllLayersVisiblility = () => {
    const nextVisible = !this.state.allLayersVisible;
    for (const layerType in this.props.layerOpacity) {
      this.changeLayerVisibility(layerType, nextVisible);
    }
    this.setState({
      allLayersVisible: nextVisible,
    });
  };

  formatLabel = value => `${(value*100).toFixed(0)}%`;

  render() {
    // TODO: Extract this to a separate component
    const LayerVisibilityButton = ({ layerVisibility, onClick }) => (
      <Button bsSize={'xsmall'} onClick={onClick}>
        <Glyphicon glyph={layerVisibility ? 'eye-open' : 'eye-close'} />
      </Button>
    );

    // One Row per layer containing controls for managing that layer's vis.
    const layerVisibilityControls = Object.entries(this.props.layerOpacity).map(
      ([layerType, opacity]) => {
        const visible = this.state.layerState[layerType].visible;
        return (
          <Row key={layerType} className='layer-controls'>
            <Row>
              <Col lg={1} className='visibility-toggle'>
                <LayerVisibilityButton
                  layerVisibility={!visible}
                  onClick={this.changeLayerVisibility.bind(this, layerType, undefined)}
                />
              </Col>
              <Col lg={10} className='layer-identifier'>
                {`Climate ${layerType} layer`}
              </Col>
            </Row>
            {
              visible &&
              <Row className='opacity'>
                <Col lg={1} className='opacity-icon'>
                  <Glyphicon glyph={'adjust'}/>
                </Col>
                <Col lg={10} className='opacity-control'>
                  <InputRange
                    // step=0.0499 ensures can go up to 100%
                    // presumed rounding error means 0.05 won't work
                    minValue={0} maxValue={1} step={0.0499}
                    formatLabel={this.formatLabel}
                    value={opacity}
                    onChange={
                      this.props.onChange.bind(this, layerType)
                    }
                  />
                </Col>
              </Row>
            }
          </Row>
        );
      }
    );

    return (
      <StaticControl position={'topright'}>
        <div
          className={'LayerOpacityControl'}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {
            this.state.showControls ?
            (
              <Grid fluid className='layer-controls-container'>
                {
                  _.keys(this.props.layerOpacity).length > 1 &&
                  <Row className='layer-controls'>
                    <Col lg={1} className='visibility-toggle'>
                      <LayerVisibilityButton
                        layerVisibility={!this.state.allLayersVisible}
                        onClick={this.toggleAllLayersVisiblility}
                      />
                    </Col>
                    <Col lg={10} className='layer-identifier'>
                      All climate layers
                    </Col>
                  </Row>
                }
                {layerVisibilityControls}
              </Grid>
            ) : (
              <Button bsSize='small'>
                <Glyphicon glyph='adjust' />
              </Button>
            )
          }
        </div>
      </StaticControl>
    );
  }
}
