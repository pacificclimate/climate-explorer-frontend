import React from 'react';
import PropTypes from 'prop-types';
import Selector from '../Selector';
import _ from 'underscore';

export default class DatasetSelector extends React.Component {
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  static propTypes = {
    meta: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  makeDatasets() {
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
    const datasets = this.makeDatasets();
    return (
      datasets.length > 0 &&
      <Selector
        label='Select Dataset'
        items={datasets}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
