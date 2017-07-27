import React from 'react';
import Selector from './Selector';

var idxString = function (scale, idx) {
  return JSON.stringify({timescale: scale, timeidx: idx}); 
  };

var timesofyear = [
  [idxString("monthly", 0), 'January'], 
  [idxString("monthly", 1), 'February'], 
  [idxString("monthly", 2), 'March'],
  [idxString("monthly", 3), 'April'],
  [idxString("monthly", 4), 'May'], 
  [idxString("monthly", 5), 'June'], 
  [idxString("monthly", 6), 'July'], 
  [idxString("monthly", 7), 'August'],
  [idxString("monthly", 8), 'September'], 
  [idxString("monthly", 9), 'October'], 
  [idxString("monthly", 10), 'November'], 
  [idxString("monthly", 11), 'December'],
  [idxString("seasonal", 0), 'Winter - DJF'], 
  [idxString("seasonal", 1), 'Spring - MAM'], 
  [idxString("seasonal", 2), 'Summer - JJA'],
  [idxString("seasonal", 3), 'Fall - SON'], 
  [idxString("yearly", 0), 'Annual']];

var TimeOfYearSelector = React.createClass({

  propTypes: {
    onChange: React.PropTypes.any, // Using 'function' logs warnings
    value: React.PropTypes.number,
  },

  render: function () {
    return (
      <Selector
        label='Time of year'
        onChange={this.props.onChange}
        items={timesofyear}
        value={this.props.value}
      />
    );
  },
});

export default TimeOfYearSelector;
