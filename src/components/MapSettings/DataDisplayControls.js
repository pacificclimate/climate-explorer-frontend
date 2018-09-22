import PropTypes from 'prop-types';
import React from 'react';

import TimeSelector from './TimeSelector';
import PaletteSelector from './PaletteSelector';
import ColourMapTypeSelector from './ColourMapTypeSelector';


export default class DataDisplayControls extends React.Component {
  static propTypes = {
    name: PropTypes.string, // 'Raster' | 'Isoline'

    times: PropTypes.object,
    timeIdx: PropTypes.string,
    timeLinked: PropTypes.bool,
    onChangeTime: PropTypes.func.isRequired,

    palette: PropTypes.string,
    onChangePalette: PropTypes.func.isRequired,

    variableId: PropTypes.string,
    range: PropTypes.object,
    logscale: PropTypes.string,
    onChangeScale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    timeLinked: false,
  };

  render() {
    return (
      <div>
        <TimeSelector
          name={this.props.name}
          times={this.props.times}
          timeIdx={this.props.timeIdx}
          timeLinked={this.props.timeLinked}
          onChange={this.props.onChangeTime}
        />
        <PaletteSelector
          name={this.props.name}
          value={this.props.palette}
          onChange={this.props.onChangePalette}
        />
        <ColourMapTypeSelector
          name={this.props.name}
          variableId={this.props.variableId}
          layerMin={this.props.range.min}
          value={this.props.logscale}
          onChange={this.props.onChangeScale}
        />
      </div>
    );
  }
}
