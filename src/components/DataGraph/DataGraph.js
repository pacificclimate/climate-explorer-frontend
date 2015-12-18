import React, { PropTypes, Component } from 'react';
var C3 = require("c3/c3");
import _ from 'underscore';
import styles from './DataGraph.css';

var DataGraph = React.createClass({

    propTypes: {
        data: React.PropTypes.object.isRequired,
        axis: React.PropTypes.object,
    },

    getDefaultProps: function() {
        return {
            padding: {
                right: 50
            },
            size: {
                height: 380
            },
            color: {
                pattern: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
            },
            data:{
                columns: []
            },
        };
    },

    _renderChart: function(data) {
        var options = {bindto: this._node}
        _.extend(options, data)
        this.chart = C3.generate(options)
    },

    componentDidMount: function() {
        this._renderChart(this.props)
    },

    componentWillReceiveProps: function(newProps) {
        // Should be able to `this.chart.load(newProps)`, but this doesn't work
        this._renderChart(newProps)
    },

    render: function () {
        return (
            <div ref={(c) => this._node = c} className={styles.container}></div>
        )
    }
});

export default DataGraph;
