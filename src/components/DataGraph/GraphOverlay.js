import React, { PropTypes, Component } from 'react';

import PanelOverlay from '../PanelOverlay/PanelOverlay';
import DataGraph from './DataGraph';
import { parseDataForC3, parseTimeSeriesForC3 } from './util';

import styles from './GraphOverlay.css';


const testData = {
    "model_id1": {
        "units": "degC",
        "2050": 21.0,
        "2080": 35.0,
        "2020": 11.0
    },
    "model_id2": {
        "units": "degC",
        "2050": 22.0,
        // "2080": 36.0,
        "2020": 12.0  
    },
    "model_id3": {
        "units": "degC",
        "2050": 23.0,
        "2080": 37.0,
        "2020": 13.0  
    },
    "model_id4": {
        "units": "mm",
        // "2050": 24.0,
        "2080": 200.0,
        "2020": 300.0  
    }
};

const testTimeSeries = {
  "id": "tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231",
  "units": "K",
  "data": {"1986-01-16T00:00:00Z": 275.75720932904414, 
          "1986-02-15T00:00:00Z": 273.4294128417969, 
          "1986-03-16T00:00:00Z": 273.4919128417969, 
          "1986-04-16T00:00:00Z": 274.8638610839844, 
          "1986-05-16T00:00:00Z": 276.67352294921875, 
          "1986-06-16T00:00:00Z": 278.1564025878906, 
          "1986-07-16T00:00:00Z": 278.5601501464844, 
          "1986-08-16T00:00:00Z": 278.06195068359375, 
          "1986-09-16T00:00:00Z": 276.9363098144531, 
          "1986-10-16T00:00:00Z": 275.7844543457031, 
          "1986-11-16T00:00:00Z": 274.8958740234375, 
          "1986-12-16T00:00:00Z": 274.33758544921875, 
          "1986-04-17T00:00:00Z": 273.89501953125, 
          "1986-07-17T00:00:00Z": 275.0113525390625, 
          "1986-10-17T00:00:00Z": 278.2606201171875, 
          "1987-01-15T00:00:00Z": 275.8712158203125, 
          "1986-07-02T00:00:00Z": 275.76947021484375
        }
};

class GraphOverlay extends Component {

    render () {

        //var data = parseDataForC3(testData);
        var data = parseTimeSeriesForC3(testTimeSeries);

        return (
            <DataGraph data={data[0]} axis={data[1]} tooltip={data[2]} />
        )
    }
};

module.exports = GraphOverlay;