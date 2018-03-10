// Selector for times (month, season, and/or annual) available in multi-year
// mean files. Disabled if `timeLinked` prop is true; this means it is
// controlled externally (by another selector) and is only used to display.

import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import _ from 'underscore';

import { sameYear, timestampToTimeOfYear } from '../../core/util';
import NullTimeSelector from './NullTimeSelector';
import Selector from '../Selector';

export default class TimeSelector extends React.Component {
  static propTypes = {
    name: PropTypes.string, // 'Raster' | 'Isoline'
    times: PropTypes.object,
    timeIdx: PropTypes.string,
    timeLinked: PropTypes.bool,
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

  static timeLinkedTooltip = <Tooltip id={"Time Link Button"}>Timestamp matching is activated</Tooltip>;
  static testTooltip = <Tooltip>TEST</Tooltip>;

  render() {
    if (!this.props.times) {
      // FIXME: Code smell:
      // metadata API call hasn't finished loading yet; return disabled selector.
      // (user shouldn't see this unless something is off with backend -
      // metadata query should be loaded by the time the user opens this menu.)
      return <NullTimeSelector/>;
    }

    return (
      <OverlayTrigger placement='right' overlay={TimeSelector.testTooltip}>
        <Selector
          disabled={this.props.timeLinked}
          label={`${this.props.name} ${this.temporalLabelPart()}`}
          items={this.timeOptions()}
          value={this.props.timeIdx}
          onChange={this.props.onChange}
        />
      </OverlayTrigger>
    );
  }
}
