import React, { PropTypes, Component } from 'react';

import PanelOverlay from '../PanelOverlay/PanelOverlay';
import DataGraph from './DataGraph';

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

class GraphOverlay extends Component {

    render () {
        return (        
            <DataGraph data={testData} />
        )
    }
};

module.exports = GraphOverlay;