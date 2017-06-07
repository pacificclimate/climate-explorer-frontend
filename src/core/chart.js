import _ from 'underscore';
import moment from 'moment';


/*
 * This module provides functions to translate chart data from api source to the
 * destination chart type
 */

var utcDateToYYYYMMDD = function (d) {
  return moment(d).utc().format('YYYY-MM-DD');
};

var timeseriesToC3 = function (data) {
  var c3Data;

  c3Data = {
    x: 'x',
    xFormat: '%Y-%m-%d',
    columns: [
      ['x'].concat(_.map(_.keys(data.data), utcDateToYYYYMMDD)),
      ['Ensemble Mean'].concat(_.values(data.data)),
    ],
  };


  return {
    data: c3Data,
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y',
          count: 11,
        },
      },
      y: {
        label: {
          text: data.units,
          position: 'outer-middle',
        },
        tick: {
          
        },
      },
    },
    tooltip: {
      grouped: true,
      format: {
        value: function (value) {
          return Math.round(value * 100) / 100 + ' ' + data.units;
        },
      },
    },
  };
};

export { timeseriesToC3 };
