import React, { PropTypes, Component } from 'react';
var C3 = require("c3/c3");
import styles from './DataGraph.css';

var DataGraph = React.createClass({

    propTypes: {
        data: React.PropTypes.object.isRequired,
        axis: React.PropTypes.object,
    },

    getDefaultProps: function() {
        return {
            data: {},
            axis: {},
            height: 380,
            padding: {
                right: 50
            }
        };
    },

    componentDidMount: function() {

        var graph = new C3.generate({
            bindto: this._node,
            size: {
                width: this.props.width,
                height: this.props.height
            },
            padding: this.props.padding,
            data: this.props.data,
            axis: this.props.axis,
            color: {
                pattern: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
            },
            tooltip: {
                grouped: true,
                format: {
                    name: function (id) { return id },
                    title: function(d) { return d },
                    value: function (value) { return value }
                    } 
            },
            subchart: { // will add a subchart if we have multiple y-axes, to allow for zooming
                show: Object.keys(this.props.axis).length > 1 ? true : false
            }
        });
    },

    render: function () {
        return (
            <div ref={(c) => this._node = c} className={styles.container}></div>
        )
    }
});

export default DataGraph;
