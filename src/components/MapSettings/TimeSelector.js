import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import { sameYear, timestampToTimeOfYear } from '../../core/util';
import NullTimeSelector from './NullTimeSelector';
import Selector from '../Selector';

export default class TimeSelector extends React.Component {
  static propTypes = {
    name: PropTypes.string, // 'Raster' | 'Isoline'
    disabled: PropTypes.bool,
    times: PropTypes.object,
    timeIdx: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  disambiguateYears() {
    const timeList = _.values(this.props.times);
    return !sameYear(_.first(timeList), _.last(timeList));
  }

  temporalLabelPart() {
    return (
      this.disambiguateYears() ?
      'Year and Time of Year' :
      'Time of Year'
    );
  }

  timeOptions() {
    const dY = this.disambiguateYears();
    return _.map(this.props.times, (v, k) =>
      [k, timestampToTimeOfYear(v, JSON.parse(k).timescale, dY)]
    );
  }

  render() {
    if (!this.props.times) {
      // Code smell:
      // metadata API call hasn't finished loading yet; return disabled selector.
      // (user shouldn't see this unless something is off with backend -
      // metadata query should be loaded by the time the user opens this menu.)
      return <NullTimeSelector/>;
    }

    // TODO: Why not just return the fully populated selector with disabled set and eliminate this special case?
    // Alternatively, still simpler, fully populated with null onChange handler.
    if (this.props.disabled) {
      return (
        <Selector
          disabled
          label={this.temporalLabelPart()}
        />
      );
    }

    return (
      <Selector
        label={`${this.props.name} ${this.temporalLabelPart()}`}
        items={this.timeOptions()}
        value={this.props.timeIdx}
        onChange={this.props.onChange}
      />
    );
  }
}
