import React, { PropTypes, Component } from 'react';

import PanelOverlay from '../PanelOverlay/PanelOverlay';
import DataGraph from './DataGraph';
const testData = {
    "model_id1": {
        "units": "degC",
        "2050": 20.0,
        "2080": 35.0,
        "2020": 10.0
    },
    "model_id2": {
        "units": "degC",
        "2050": 20.0,
        "2080": 35.0,
        "2020": 10.0  
    },
    "model_id3": {
        "units": "degC",
        "2050": 20.0,
        "2080": 35.0,
        "2020": 10.0  
    },
    "model_id4": {
        "units": "degC",
        "2050": 20.0,
        "2080": 35.0,
        "2020": 10.0  
    }
};

        // <PanelOverlay title={'Data Plot'} maxHeight={600} align={'right'}>
        //     <DataGraph data={testData} />
        // </PanelOverlay>

class GraphOverlay extends Component {
    render () {
        return (
        <PanelOverlay title={'Data Plot'} maxHeight={600} align={'right'}>
        <DataGraph data={testData} />
        </PanelOverlay>
        )
    }
};

module.exports = GraphOverlay;