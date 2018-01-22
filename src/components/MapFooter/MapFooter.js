import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import './MapFooter.css';
import { sameYear, timestampToTimeOfYear } from '../../core/util';


class MapFooter extends React.Component {
  static propTypes = {
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    run: PropTypes.string,
    variable: PropTypes.string,
    variableTimes: PropTypes.object,
    variableWmsTime: PropTypes.string,
    hasValidComparand: PropTypes.bool,
    comparand: PropTypes.string,
    comparandWmsTime: PropTypes.string,
  };

  render() {
    const dataset = `${this.props.start_date}-${this.props.end_date}`;
    let resolution = _.invert(this.props.variableTimes)[this.props.variableWmsTime];
    resolution = resolution && JSON.parse(resolution).timescale;
    const times = _.values(this.props.variableTimes);
    const disambiguateYears = !sameYear(_.first(times), _.last(times));
    const vTime = timestampToTimeOfYear(this.props.variableWmsTime, resolution, disambiguateYears);

    let comp = null;
    if (this.props.hasValidComparand) {
      var cTime = timestampToTimeOfYear(this.props.comparandWmsTime, resolution, disambiguateYears);
      comp = `vs. ${cTime} ${this.props.comparand}`;
    }

    return (
        <h5>
          Dataset {dataset} {this.props.run}: {vTime} {this.props.variable} {comp}
        </h5>
    );
  }
}

export default MapFooter;
