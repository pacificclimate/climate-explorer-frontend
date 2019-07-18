import PropTypes from 'prop-types';
import React from 'react';

import _ from 'lodash';

import './MapLegend.css';
import { sameYear, timestampToTimeOfYear } from '../../core/util';
import { currentDataSpec } from '../map-controllers/map-helpers';


export default class MapLegend extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    experiment: PropTypes.string,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    run: PropTypes.string,
    raster: PropTypes.shape({
      variableId: PropTypes.string,
      wmsTime: PropTypes.string,
      times: PropTypes.object,
    }),
    isoline: PropTypes.shape({
      variableId: PropTypes.string,
      wmsTime: PropTypes.string,
      times: PropTypes.object,
    }),
    annotated: PropTypes.shape({
      variableId: PropTypes.string,
      wmsTime: PropTypes.string,
      times: PropTypes.object,
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
    return wmsTime ? `${this.timeOfYear(times, wmsTime)} ${variableId}` :
      `${variableId} not available for this time period`;
  }

  render() {
    // When the props for this component don't have useful values,
    // we want to display a less obnoxious result.
    // The following test is minimal and sufficient for this condition.
    if (!_.every(_.pick(this.props, 'model_id', 'start_date'))) {
      return <span>Loading...</span>;
    }
    return (
      <span>
        {`${this.props.model_id}; ${this.props.experiment};`}
        {` ${currentDataSpec(this.props)}:`}
        {` ${this.timeAndVariable(this.props.raster)} (raster)`}
        {
          this.props.hasValidComparand ?
            (this.props.variable_id === this.props.comparand_id ?
              ' only' :
              ` & ${this.timeAndVariable(this.props.isoline || this.props.annotated)} (isolines)`) :
            ''
        }
      </span>
    );
  }
}
