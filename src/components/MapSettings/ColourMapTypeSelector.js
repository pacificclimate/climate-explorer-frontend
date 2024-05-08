// Selector for determining whether a map's colours are scaled
// logarithmically or linearly.
// The logscale option is disabled if logscale colouring is not supported for
// the variable.
// A variable supports logscale colouring if:
// 1) all its values are > 0, or
// 2) the variable is marked "overrideLogarithmicScale: true" in the
//    variable-options.yaml config file (but values will be clipped to > 0)

import PropTypes from "prop-types";
import React from "react";

import Selector from "../Selector";
import { getVariableOptions } from "../../core/util";
import { colourMapTypeSelectorLabel } from "../guidance-content/info/InformationItems";

export default class ColourMapTypeSelector extends React.Component {
  static propTypes = {
    name: PropTypes.string, // 'Raster' | 'Isoline'
    variableId: PropTypes.string,
    layerMin: PropTypes.number,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const override = getVariableOptions(
      this.props.variableId,
      "overrideLogarithmicScale",
    );
    const layerMin = this.props.layerMin || -1;
    const colourMapTypes = [
      ["false", "Linear", false],
      ["true", "Logarithmic", layerMin <= 0 && !override],
    ];

    return (
      <Selector
        label={colourMapTypeSelectorLabel}
        items={colourMapTypes}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
