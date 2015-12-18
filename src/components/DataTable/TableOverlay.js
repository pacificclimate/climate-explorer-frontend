import React, { PropTypes, Component } from 'react';

import PanelOverlay from '../PanelOverlay/PanelOverlay';
import DataTable from './DataTable';

//import styles from './TableOverlay.css';

const testData = {
    'file0':
        {
        'mean': 303.97227647569446,
        'stdev': 8.428096450998078,
        'min': 288.71807861328125,
        'max': 318.9695739746094,
        'median': 301.61065673828125,
        'ncells': 72,
        'units': 'K',
        'time': '1985-06-30T12:00:00Z'
        },
    'file1':
        {
        'mean': 305,
        'stdev': 8.7,
        'min': 299.0,
        'max': 311.0,
        'median': 42.1,
        'ncells': 72,
        'units': 'K',
        'time': '1985-06-30T12:00:00Z'
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