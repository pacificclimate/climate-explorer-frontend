/******************************************************************
 * TimeOfYearSelector.js - dropdown for user to select time of year
 *
 * This selector offer a choice of 12 months, 4 seasons, and annual
 * to the user. Internally, the available times are keyed with a
 * numerical index, which is passed as a key to any provided
 * callback function.
 *
 * The key can be converted to an object containing a resolution
 * (monthly, seasonal, or yearly) and an index, such as
 * {timescale: monthly, timeidx: 3} for March by the
 * util.timeKeyToResolutionIndex() function.
 *
 * The key can be converted into a human readable string like
 * "March" or "Spring - MAM" by the util.timeKeyToTimeOfYear()
 * function.
 *
 * A key can be generated from an index and timescale with
 * util.resolutionIndexToTimeKey().
 *
 * Those three functions provide a standard ordering and encoding for
 * the TimeOfYearSelector component.
 *
 * Optionally, the monthly, seasonal, and yearly props may
 * be passed to show (true) or hide (false) some of the options.
 ******************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import Selector from './Selector';
import { timeKeyToTimeOfYear } from '../../core/util';
import { timeOfYearSelectorLabel } from '../guidance-content/info/InformationItems';

class TimeOfYearSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.any, // Using 'function' logs warnings
    value: PropTypes.any,
    monthly: PropTypes.bool,  // Show month options
    seasonal: PropTypes.bool, // Show season options
    yearly: PropTypes.bool,   // Show annual option
    inlineLabel: PropTypes.bool,
  };

  static defaultProps = {
    inlineLabel: false,
    monthly: true,
    seasonal: true,
    yearly: true,
  };

  render() {
    let timesofyear = [];
    function addTimeRange(start, end) {
      for (let index = start; index <= end; index++) {
        timesofyear.push([index, timeKeyToTimeOfYear(index)]);
      }
    }

    if (this.props.monthly) {
      addTimeRange(0, 11);
    }
    if (this.props.seasonal) {
      addTimeRange(12, 15);
    }
    if (this.props.yearly) {
      addTimeRange(16, 16);
    }

    return (
      <Selector
        label={timeOfYearSelectorLabel}
        items={timesofyear}
        {...this.props}
      />
    );
  }
}

export default TimeOfYearSelector;
