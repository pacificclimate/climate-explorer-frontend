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
    comparandTimes: PropTypes.object,
    comparand: PropTypes.string,
    comparandWmsTime: PropTypes.string,
  };
  
  timeOfYear(times, wmsTime) {
    const resolution = _.invert(times)[wmsTime];
    const timescale = resolution && JSON.parse(resolution).timescale;
    const timeValues = _.values(times);
    const disambiguateYears = !sameYear(_.first(timeValues), _.last(timeValues));
    return timestampToTimeOfYear(wmsTime, timescale, disambiguateYears);
  }
  
  timeAndSymbol(times, wmsTime, symbol) {
    return `${this.timeOfYear(times, wmsTime)} ${symbol}`;
  }

  render() {
    return (
        <h5>
          Dataset {`${this.props.start_date}-${this.props.end_date}`} {this.props.run}:
          {' '}
          {this.timeAndSymbol(this.props.variableTimes, this.props.variableWmsTime, this.props.variable)}
          {' '}
          {
            this.props.hasValidComparand && 
            `vs. ${this.timeAndSymbol(this.props.comparandTimes, this.props.comparandWmsTime, this.props.comparand)}`
          }
        </h5>
    );
  }
}

export default MapFooter;
