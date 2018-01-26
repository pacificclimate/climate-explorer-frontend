import PropTypes from 'prop-types';
import React from 'react';

import TimeSelector from './TimeSelector';
import PaletteSelector from './PaletteSelector';
import ScaleSelector from './ScaleSelector';


export default class DataDisplayControls extends React.Component {
  static propTypes = {
    name: PropTypes.string, // 'Raster' | 'Isoline'
    disabled: PropTypes.bool,  // is this the whole selector or just time?

    times: PropTypes.object,
    timeIdx: PropTypes.string,
    timeLinked: PropTypes.bool,
    onChangeTime: PropTypes.func.isRequired,

    palette: PropTypes.string,
    onChangePalette: PropTypes.func.isRequired,

    variableId: PropTypes.string,
    layerMin: PropTypes.number,
    logscale: PropTypes.string,
    onChangeScale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    timeLinked: false,
  };

  constructor(props) {
    super(props);

    this.state = {
    };
  }

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
        <ScaleSelector
          name={this.props.name}
          variableId={this.props.variableId}
          layerMin={this.props.layerMin}
          value={this.props.logscale}
          onChange={this.props.onChangeScale}
        />
      </div>
    );
  }
}
