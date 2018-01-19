import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';
import {sameYear, timestampToTimeOfYear} from '../../core/util';
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

  // From context of MapController
  // makeTimeSelector (symbol) {
  //   var times = this.state[`${symbol}Times`]
  //
  //   if(_.isUndefined(times)) {
  //     //metadata API call hasn't finished loading yet; return disabled selector.
  //     //(user shouldn't see this unless something is off with backend -
  //     // metadata query should be loaded by the time the user opens this menu.)
  //     return (
  //       <Selector
  //         label={'Year and Time of Year'}
  //         disabled={true}
  //       />
  //     );
  //   }
  //
  //   var timeList = _.values(times);
  //   var disambiguateYears = !sameYear(_.first(timeList), _.last(timeList));
  //   var labelText = disambiguateYears ? 'Year and Time of Year' : 'Time of Year';
  //
  //   //user has chosen to link up times across the two variables, so
  //   //disable the comparand time selector.
  //   if(this.state.linkTimes && symbol == 'comparand') {
  //     var selector = (
  //       <Selector
  //         label={labelText}
  //         disabled={true}
  //       />
  //     );
  //     selector = this.addTooltipWrapper(selector, 'Timestamp matching is activated', 'right');
  //     return selector;
  //   }
  //
  //   var timeOptions = _.map(times, function (v, k) {
  //     return [k, timestampToTimeOfYear(v, JSON.parse(k).timescale, disambiguateYears)];
  //   });
  //
  //
  //   labelText = `${this.userLabels[symbol]} ${labelText}`;
  //   var value = this.state[`${symbol}TimeIdx`];
  //
  //   return (
  //     <Selector
  //       label={labelText}
  //       onChange={this.updateTime.bind(this, symbol)}
  //       items={timeOptions}
  //       value={value}
  //     />
  //   );
  // }

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
    // rasterTimeSelector = this.makeTimeSelector('variable');
    // isolineTimeSelector = this.makeTimeSelector('comparand');

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
