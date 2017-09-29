/**********************************************************************
 * Selector.js - a dropdown menu component for users to make a choice
 *
 * Props:
 *   onChange - callback function to ping when user selects something
 *   disabled - if true, selector will be greyed out and noninteractive
 *   value - the "already selected" value to be displayed initially
 *   label - title that will be printed above the dropdown
 *   items - the array of possible choices. Can be either:
 *             * an array of strings - the string user picks is sent to
 *               callback
 *             * a array of tuples: the 1st item in the tuple will be
 *               the string displayed the users, the 0th is what is sent
 *               to the callback if the displayed string is selected.
 **********************************************************************/

import React from 'react';
import { Input } from 'react-bootstrap';

var Selector = React.createClass({

  propTypes: {
    onChange: React.PropTypes.any, // Using 'function' logs warnings
    label: React.PropTypes.string,
    items: React.PropTypes.array,
    value: React.PropTypes.node,
    disabled: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      label: 'Selection',
      items: [],
      value: '',
      disabled: false,
    };
  },

  handleChange: function (event) {
    this.props.onChange(event.target.value);
  },

  render: function () {
    return (
      <Input
        type='select'
        label={this.props.label}
        onChange={this.handleChange}
        value={this.props.value ? this.props.value : undefined}
        disabled={this.props.disabled}
      >
        {
          this.props.items.map(function (item) {
            return Array.isArray(item) ? <option value={item[0]} key={item[0]}>{item[1]}</option> : <option value={item} key={item}>{item}</option>;
          })
        }
      </Input>
      );
  },
});

export default Selector;
