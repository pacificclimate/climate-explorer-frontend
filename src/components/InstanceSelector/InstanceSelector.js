import React from 'react';
import PropTypes from 'prop-types';
import Selector from '../Selector/Selector';
import _ from 'underscore';
/******************************************************************
 * InstanceSelector.js - Instance-selecting widget
 * 
 * This dropdown allows the user to select an "instance" of data
 * to view, consisting of a start date, an end date, and a run.
 * Data describing the instance may be spread over multiple files.
 ******************************************************************/


export default class InstanceSelector extends React.Component {
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  static propTypes = {
    meta: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  makeInstances() {
    var ids = this.props.meta.map(el =>
      [
        JSON.stringify(_.pick(el, 'start_date', 'end_date', 'ensemble_member')),
        `${el.ensemble_member} ${el.start_date}-${el.end_date}`
      ]
    );
    ids = _.uniq(ids, false, item => item[1]);
    return ids;
  }

  render() {
    const instances = this.makeInstances();
    return (
      instances.length > 0 &&
      <Selector
        label='Select Dataset'
        items={instances}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
