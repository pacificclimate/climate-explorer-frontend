import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'react-bootstrap';

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
      };
    }

    handleMouseEnter = () => this.setState({ showControls: true });
    handleMouseLeave = () => this.setState({ showControls: false });

    render() {
      const show = this.state.showControls;
      const titleSep = show ? ' ' : <br/>;
      return (
        <StaticControl position={'topright'}>
          <div
            className={'LayerOpacityControl'}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          >
            <Grid fluid>
              <Row>
                <Col lg={12} className='text-center'>
                  Climate{titleSep}layer{titleSep}opacity
                </Col>
              </Row>
              {
                show &&
                Object.entries(this.props.layerOpacity).map(
                  ([layerType, opacity]) => (
                    <Row key={layerType}>
                      <Col lg={3}>{layerType}</Col>
                      <Col lg={8}>
                        <InputRange
                          minValue={0} maxValue={1} step={0.05}
                          formatLabel={value => `${(value*100).toFixed(0)}%`}
                          value={opacity}
                          onChange={this.props.onChange.bind(this, layerType)}
                        />
                      </Col>
                    </Row>
                  )
                )
              }
            </Grid>
          </div>
        </StaticControl>
      );
    }
}
