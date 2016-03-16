import React from 'react';
import Selector from './Selector';

var timesofyear = [[0, 'January'], [1, 'February'], [2, 'March'],
    [3, 'April'], [4, 'May'], [5, 'June'], [6, 'July'], [7, 'August'],
    [8, 'September'], [9, 'October'], [10, 'November'], [11, 'December'],
    [12, 'Winter - DJF'], [13, 'Spring - MAM'], [14, 'Summer - JJA'],
    [15, 'Fall - SON'], [16, 'Annual']];

var TimeOfYearSelector = React.createClass({
  render: function () {
    return (<Selector label="Time of year" onChange={this.props.onChange} items={timesofyear} value={this.props.value} />);
  }
});

export default TimeOfYearSelector;
