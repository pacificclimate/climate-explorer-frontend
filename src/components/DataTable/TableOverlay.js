import React, { PropTypes, Component } from 'react';

import PanelOverlay from '../PanelOverlay/PanelOverlay';
import DataTable from './DataTable';

//import styles from './TableOverlay.css';

const testData = {
    "model_id1": {
        "min": 10.0,
        "max": 40.0,
        "mean": 23.0,
        "median": 25.0,
        "stdev": 2.0,
        "units": "degC change"
    },
    "model_id2": {
        "min": 5.0,
        "max": 30.0,
        "mean": 15.0,
        "median": 18.0,
        "stdev": 1.5,
        "units": "degC change"
    },
    "model_id3": {
        "min": 15.0,
        "max": 35.0,
        "mean": 20.0,
        "median": 19.0,
        "stdev": 1.0,
        "units": "degC change"
    },
    "model_id4": {
        "min": -3.0,
        "max": 15.0,
        "mean": 8.0,
        "median": 7.0,
        "stdev": 3.0,
        "units": "degC change"
    }
};

class TableOverlay extends Component {

    render () {
        return (        
            <DataTable data={testData} />
        )
    }
};

module.exports = TableOverlay;