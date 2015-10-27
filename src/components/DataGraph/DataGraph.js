import React, { PropTypes, Component } from 'react';
//import Rickshaw from 'rickshaw';
var Rickshaw = require("rickshaw/rickshaw");

import styles from './DataGraph.css';

var DataGraph = React.createClass({

    parseData: function(data) {
        var allModelsData = [];
        for (let model in data) {

            var modelData = []
            for (let key in data[model]) {
                if (parseInt(key)) {
                    var val = data[model][key];
                    modelData.push({x: parseInt(key), y: val});
                }
            }

            // sort model data along x axis
            allModelsData.push({
                color: 'steelblue', // generate dynamically
                data:modelData
            });
        }
        return allModelsData;
    },


    componentDidMount: function() {

        var seriesData = this.parseData(this.props.data);

        var graph = new Rickshaw.Graph( {
            element: document.getElementById('graph'),
            renderer: 'lineplot',
            interpolation: 'linear',
            min: 'auto',
            padding: {
                top: 0.1,
                bottom: 0.1,
                right: 0.1,
                left: 0.1
            },
            series: seriesData
        });

        var y_ticks = new Rickshaw.Graph.Axis.Y( {
            graph: graph,
            orientation: 'left',
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            element: document.getElementById('y_axis')
        } );

        var graphHover = new Rickshaw.Graph.HoverDetail({
            graph:graph
        });

        graph.render();
    },

    render: function () {
        return (
            <div>
            <div id={'y_axis'} className={styles.y_axis}></div>
            <div id={'graph'} className={styles.container}></div>
            </div>
        )
    }
});

export default DataGraph;