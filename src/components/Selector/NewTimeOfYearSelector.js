// Time of Year selector, based on React Select and with value replacement
// TODO: Move into react-select-components (after confidence established)

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import fp, { find } from 'lodash/fp';
import withValueReplacement from '../../HOCs/withValueReplacement';

const WVRSelect = withValueReplacement()(Select);

const isInvalidValue = value => fp.isUndefined(value) || value.isDisabled;

const replaceInvalidValue =
  (options) => (value) => find({ isDisabled: false })(options);

const labels = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Winter—DJF', 'Spring—MAM', 'Summer—JJA', 'Fall—SON', 'Annual'
];


export default class TimeOfYearSelector extends React.Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.any, // Using 'function' logs warnings
    monthly: PropTypes.bool,  // Show month options
    seasonal: PropTypes.bool, // Show season options
    yearly: PropTypes.bool,   // Show annual option
  };

  static defaultProps = {
    inlineLabel: false,
    monthly: true,
    seasonal: true,
    yearly: true,
  };

  render() {
    const { monthly, seasonal, yearly } = this.props;
    const options = fp.mapWithKey(
      (label, index) => ({
        label,
        value: index,
        isDisabled: (
          (index < 12 && !monthly) ||
          (12 <= index && index < 16 && !seasonal) ||
          (16 <= index && !yearly)
        )
      })
    )(labels);

    return <WVRSelect
      options={options}
      value={this.props.value}
      onChange={this.props.onChange}
      isInvalidValue={isInvalidValue}
      replaceInvalidValue={replaceInvalidValue(options)}
    />
  }
}

