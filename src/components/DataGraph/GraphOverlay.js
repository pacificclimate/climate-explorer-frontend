import React, { PropTypes, Component } from 'react';

import PanelOverlay from '../PanelOverlay/PanelOverlay';
import DataGraph from './DataGraph';
import { parseDataForC3, parseTimeSeriesForC3 } from '../../core/util';

import styles from './GraphOverlay.css';

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