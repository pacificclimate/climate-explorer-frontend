import React, { PropTypes, Component } from 'react';

import PanelOverlay from '../PanelOverlay/PanelOverlay';
import DataGraph from './DataGraph';
import parseC3Data from './util';

import styles from './GraphOverlay.css';

const testData = {
    'id': 'tmax_monClim_PRISM_historical_run1_198101-201012',
    'units': 'degC',
    'data': {
          '1985-01-15T00:00:00Z': 1.5,
          '1985-02-15T00:00:00Z': 2.5,
          '1985-03-15T00:00:00Z': 5.5,
          '1985-04-15T00:00:00Z': 10.2,
          '1985-05-15T00:00:00Z': 13.5,
          '1985-06-15T00:00:00Z': 20.1,
          '1985-07-15T00:00:00Z': 24.4,
          '1985-08-15T00:00:00Z': 25.2,
          '1985-09-15T00:00:00Z': 21.7,
          '1985-10-15T00:00:00Z': 15.8,
          '1985-11-15T00:00:00Z': 9.2,
          '1985-12-15T00:00:00Z': 3.1,
    }
};

class GraphOverlay extends Component {

    render () {

        var data = parseC3Data(testData);

        return (
            <DataGraph data={data[0]} axis={data[1]} />
        )
    }
};

module.exports = GraphOverlay;