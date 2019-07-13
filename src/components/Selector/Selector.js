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
 *             * an array of pairs: the 1st item in the tuple will be
 *               the string displayed the users, the 0th is what is sent
 *               to the callback if the displayed string is selected.
 *             * an array of triples: the 0th item is the callback string,
 *               the 1st is the choice label, the 2nd is a boolean for
 *               whether this choice is disabled
 **********************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import { ControlLabel, MenuItem, Dropdown } from 'react-bootstrap';
import _ from 'lodash';
import styles from './Selector.module.css';

class Selector extends React.Component {
  static propTypes = {
    onChange: PropTypes.any, // Using 'function' logs warnings
    label: PropTypes.node,
    items: PropTypes.array,
    value: PropTypes.node,
    disabled: PropTypes.bool,
    inlineLabel: PropTypes.bool,
  };

  static defaultProps = {
    label: 'Selection',
    items: [],
    value: '',
    disabled: false,
    inlineLabel: false,
  };

  componentWillReceiveProps(newProps) {
    this.updateDisplayValue(newProps.value, newProps.items);
  }

  //store the display string for the already-selected value
  updateDisplayValue = (value, items=this.props.items) => {
    if(_.indexOf(items, value) != -1) {
      //display string is the same as value string.
      this.displayString = value;
    }
    else { //display the associated user string,
      //if associated user string cannot be found,
      //just display the original string, on the assumption
      //it's something like "Select a Choice"
      var item = _.findWhere(items, {0: value});
      this.displayString = item ? item[1] : value;
    }
  };

  handleChange = (event) => {
    this.props.onChange(event);
  };

  //renders an item into a react.bootstrap MenuItem
  //if item is an atom, it is used for both user text and event key
  //otherwise, the 0th item is event key, the 1st user text, and the 2rd,
  //if present, whether the item is disabled.
  createMenuItem = (item) => {
    var choice = _.isArray(item) ? item[1] : item;
    var eventKey = _.isArray(item) ? item[0] : item;
    var disabled = _.isArray(item) && item.length > 2 ? item[2] : false;

    return (
      <MenuItem key={choice} eventKey={eventKey} disabled={disabled} className={styles.selectoritem}>
        {choice}
      </MenuItem>
    );
  };

  render() {
    return (
        <div className={styles.selectorframe}>
          <ControlLabel
            className={
              this.props.inlineLabel ?
                styles.selectorlabel_inline :
                styles.selectorlabel_stacked
            }
          >
            {this.props.label}
          </ControlLabel>
          <Dropdown vertical disabled={this.props.disabled} onSelect={this.handleChange} id={this.props.label}>
            <Dropdown.Toggle className={styles.selectortitle}>
              {this.displayString}
            </Dropdown.Toggle>
            <Dropdown.Menu className={styles.selectormenu}>
              {this.props.items.map(this.createMenuItem)}
            </Dropdown.Menu>
          </Dropdown>
        </div>
    );
  }
}

export default Selector;
