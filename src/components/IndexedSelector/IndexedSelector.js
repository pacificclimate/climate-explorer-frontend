/*************************************************************************************
 * IndexedSelector.js - widget allowing choices of arbitrary data type
 * 
 * This selector accepts an array of things and a function that generates a unique text 
 * string for each thing. It maintains an index of which item each text string refers
 * to, and when a text string is selected, passing the original item to the callback function. 
 * 
 * Its props are:
 *   - items: an array of items to be selected
 *   - itemLabeler: function that generates a unique text string describing each item
 *   - onChange: callback function which will receive an object
 *   - label: text to display next to the dropdown
 *   - value: the currently selected item
 *   - itemsDisabled: an optional array of booleans whether each item is disabled
 *   - disabled: optional boolean for whether to disable the whole selector
 *   
 * This is useful for creating selectors that offer combinations of parameters, such
 * as start date, end date, and run. The parameters can be encoded as attribute-value
 * pairs on objects passed to IndexedSelector. 
 *************************************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import _ from 'underscore';
import Selector from '../Selector/Selector';

export default class IndexedSelector extends React.Component {
  static propTypes = {
    items: PropTypes.array,
    itemLabeler: PropTypes.any,
    label: PropTypes.string,
    onChange: PropTypes.any,
    value: PropTypes.any,
    itemsDisabled: PropTypes.bool,
    disabled: PropTypes.array
  };
  
  //todo: handle empty items case.
  componentWillReceiveProps(newProps) {
    const disabled = newProps.itemsDisabled ? newProps.itemsDisabled : 
      Array(newProps.items.length).fill(false);
    this.update(newProps.value, newProps.items, newProps.itemLabeler, disabled);
  }
  
  handleChange(index) {
    this.props.onChange(this.props.items[index]);
  }

  update(value, items, itemLabeler, itemsDisabled) {
    let menuItems = [];
    for(let i = 0; i < items.length; i++) {
      menuItems.push([i, itemLabeler(items[i]), itemsDisabled[i]])
    }
    
    this.menuItems = menuItems;
    this.displayString = _.isObject(value) ? itemLabeler(value) : value;
  }
  
  render() {
    return (
      <Selector
        label={this.props.label}
        value={this.props.value}
        items={this.menuItems}
        onChange={this.handleChange.bind(this)}
        disabled={this.props.disabled}
      /> 
    );
  }
}
