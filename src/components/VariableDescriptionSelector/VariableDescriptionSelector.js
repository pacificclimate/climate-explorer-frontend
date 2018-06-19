/************************************************************************
 * VariableDescriptionSelector.js - Variable Choice dropdown
 * 
 * This selector accepts an array of file metadata and a constraint object.
 * It renders a dropdown menu allowing the user to select any variable that
 * is present in at least on file that matches the constraints.
 * Each variable is shown with a description.
 * 
 * Sometimes the same variable has different descriptions reflecting 
 * different algorithms for calculating the variable, so it is necessary
 * to keep track of which variable/description pair the user selects, not
 * just the variable alone.
 * 
 * Props:
 *   - meta: array of data file metadata
 *   - onChange: callback function, will receive an object with "variable_id"
 *       and "variable_name" attributes for the selection.
 *   - value: currently selected variable and description
 *   - constraints: an object specifying additional constraints on which
 *       datasets (and their variables) should be considered, as attritbute:
 *       values pairs that individual data file metadata must match.
 *   - disabled: true to disable entire dropdown
 *   - label: label to display beside the dropdown
 ************************************************************************/
import _ from 'underscore';
import IndexedSelector from '../IndexedSelector';
import React from 'react';
import PropTypes from 'prop-types';

export default class VariableDescriptionSelector extends React.Component {
  static propTypes = {
    meta: PropTypes.array,
    onChange: PropTypes.any,
    value: PropTypes.any,
    constraints: PropTypes.any,
    disabled: PropTypes.boolean
  };
  
  componentWillReceiveProps(newProps) {
    this.update(newProps.meta, newProps.constraints);
  }
  
  //generate items for dropdown.
  update(meta, constraints) {
    function varDesList(meta, constraints) {
      return _.uniq(_.map(_.where(meta, constraints), m=> {
        return _.pick(m, "variable_id", "variable_name");
      }), false, JSON.stringify);
    } 
    
    const allVars = varDesList(meta, {});
    const availableVars = varDesList(meta, constraints);
    this.items = allVars;
    this.itemsDisabled = _.map(allVars, v => {
      for(let avail of availableVars) {
        if (avail.variable_id === v.variable_id &&
            avail.variable_name == v.variable_name) {
          return false;
        }
      }
      return true;
    });
  }
  
  itemLabeler(i) {
    return `${i.variable_id} - ${i.variable_name}`;
  }
  
  render() {
    return (
        <IndexedSelector
          items={this.items}
          itemsDisabled={this.itemsDisabled}
          label={this.props.label ? this.props.label : "Select Variable"}
          disabled={this.props.disabled}
          value={this.props.value}
          onChange={this.props.onChange}
          itemLabeler={this.itemLabeler}
        />);
  }
}