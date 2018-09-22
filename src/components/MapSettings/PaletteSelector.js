// Selector for colour palette used on data maps.

import PropTypes from 'prop-types';
import React from 'react';

import Selector from '../Selector';
import {
  paletteSelectorLabel,
} from '../guidance-content/info/InformationItems';


export default class PaletteSelector extends React.Component {
  static propTypes = {
    name: PropTypes.string, // 'Raster' | 'Isoline'
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  static palettes = [
    ['seq-Blues', 'light blues'],
    ['seq-BkBu', 'dark blues'],
    ['seq-Greens', 'light greens'],
    ['seq-BkGn', 'dark greens'],
    ['seq-Oranges', 'oranges'],
    ['seq-BuPu', 'purples'],
    ['seq-Greys', 'greys'],
    ['seq-BkYl', 'yellows'],
    ['x-Occam', 'rainbow'],
    ['default', 'ocean'],
    ['seq-cubeYF', 'cube'],
    ['psu-magma', 'sunset'],
  ];

  render() {
    return (
      <Selector
        label={paletteSelectorLabel}
        items={PaletteSelector.palettes}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
