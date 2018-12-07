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
      })),
    };
  }

  handleMouseEnter = () => this.setState({ showControls: true });
  handleMouseLeave = () => this.setState({ showControls: false });
  
  toggleLayerVisibility = layerType => {
    // If current layer is visible, save its current opacity, then hide it by
    // setting its opacity to 0.
    // If current layer is invisible, restore its saved opacity.

    const currLayerVisible = this.state.layerState[layerType].visible;

    // Update layer opacity according to visibility.
    this.props.onChange(
      layerType,
      currLayerVisible ? 0 : this.state.layerState[layerType].prevOpacity
    );

    // Update layer's visibility state: Toggle visibility flag,
    // store current opacity.
    this.setState(prevState => ({
      layerState: {
        ...prevState.layerState,
        [layerType]: {
          visible: !currLayerVisible,
          prevOpacity: this.props.layerOpacity[layerType],
        },
      },
    }));
  }

  formatLabel = value => `${(value*100).toFixed(0)}%`;

  render() {
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
                  Object.entries(this.props.layerOpacity).map(
                    ([layerType, opacity]) => {
                      const showLayer = this.state.layerState[layerType].visible;
                      return (
                        <Row key={layerType} className='layer-controls'>
                          <Row>
                            <Col lg={1} className='visibility-toggle'>
                              <Button
                                bsSize={'xsmall'}
                                onClick={
                                  this.toggleLayerVisibility.bind(this, layerType)
                                }
                              >
                                <Glyphicon
                                  glyph={showLayer ? 'eye-open' : 'eye-close'}
                                />
                              </Button>
                            </Col>
                            <Col lg={10} className='layer-identifier'>
                              {`Climate ${layerType} layer`}
                            </Col>
                          </Row>
                          {
                            showLayer &&
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
                  )
                }
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
