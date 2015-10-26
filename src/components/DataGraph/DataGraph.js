import React, { PropTypes, Component } from 'react';
//import Rickshaw from 'rickshaw';
var Rickshaw = require("rickshaw/rickshaw");


var DataGraph = React.createClass({

    componentDidMount: function() {
        var graph = new Rickshaw.Graph( {
            element: this.getDOMNode(),
            renderer: 'scatterplot',
            interpolation: 'linear',
            series: [
    {
      color: 'steelblue',
      data: [ { x: 0, y: 80}, { x: 1, y: 15 }, { x: 2, y: 79 } ]
    }, {
      color: 'lightblue',
      data: [ { x: 0, y: 30}, { x: 1, y: 20 }, { x: 2, y: 64 } ]
    }
  ]
        });
      graph.render();
    },

    render: function () {
        return (
            <div></div>
        )
    }
});

export default DataGraph;