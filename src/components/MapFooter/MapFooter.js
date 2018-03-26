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
    raster: PropTypes.shape({
      variableId: PropTypes.string,
      wmsTime: PropTypes.string,
      times: PropTypes.object
    }),
    isoline: PropTypes.shape({
      variableId: PropTypes.string,
      wmsTime: PropTypes.string,
      times: PropTypes.object
    }),
    annotated: PropTypes.shape({
      variableId: PropTypes.string,
      wmsTime: PropTypes.string,
      times: PropTypes.object
    }),
    hasValidComparand: PropTypes.bool,
  };
  
  timeOfYear(times, wmsTime) {
    const resolution = _.invert(times)[wmsTime];
    const timescale = resolution && JSON.parse(resolution).timescale;
    const timeValues = _.values(times);
    const disambiguateYears = !sameYear(_.first(timeValues), _.last(timeValues));
    return timestampToTimeOfYear(wmsTime, timescale, disambiguateYears);
  }
  
  timeAndVariable({ times, wmsTime, variableId }) {
    return `${this.timeOfYear(times, wmsTime)} ${variableId}`;
  }

  render() {
    return (
        <h5>
          Dataset {`${this.props.start_date}-${this.props.end_date}`} {this.props.run}:
          {' '}
          {this.timeAndVariable(this.props.raster)}
          {' '}
          {
            this.props.hasValidComparand &&
            `vs. ${this.timeAndVariable(this.props.isoline || this.props.annotated)}`
          }
        </h5>
    );
  }
}

export default MapFooter;
