import React from 'react';
import PropTypes from 'prop-types';
import Selector from '../Selector/Selector';
import _ from 'underscore';
/******************************************************************
 * DataSpecSelector.js - Data Specification selecting widget
 * 
 * This dropdown allows the user to specify a single set of data to
 * view. The user selects a combination of parameters: start date,
 * end date, and a run. 
 * 
 * Typically, the user selects a model, variable, and emissions 
 * scenario in a top level portal. Some data viewers show multiple sets
 * of data that fit those broad parameters at once: 
 *   * Context graph
 *   * Long Term Average graph 
 *   * Variable Response graph 
 * 
 * But most viewers require the user to completely specify a single 
 * unique set of data to examine in detail by providing a start date,
 * end date, and run as well as the portal parameters.
 * 
 * Viewers that require a full data specification and use this 
 * component to let the user select it:
 *   * Dual, Single, and Precipitation MapControllers
 *   * Single and Dual Annual Cycle Graphs
 ******************************************************************/


export default class DataSpecSelector extends React.Component {
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  static propTypes = {
    meta: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  makeDataSpecs() {
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
    const dataSpecs = this.makeDataSpecs();
    return (
      dataSpecs.length > 0 &&
      <Selector
        label='Select Dataset'
        items={dataSpecs}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
