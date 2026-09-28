import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";
import styles from "./DataGraph.module.css";
var C3 = require("c3/c3");

class DataGraph extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    axis: PropTypes.object,
  };

  static defaultProps = {
    padding: {
      right: 50,
    },
    size: {
      height: 380,
    },
    color: {
      pattern: [
        "#1f77b4",
        "#aec7e8",
        "#ff7f0e",
        "#ffbb78",
        "#2ca02c",
        "#98df8a",
        "#d62728",
        "#ff9896",
        "#9467bd",
        "#c5b0d5",
        "#8c564b",
        "#c49c94",
        "#e377c2",
        "#f7b6d2",
        "#7f7f7f",
        "#c7c7c7",
        "#bcbd22",
        "#dbdb8d",
        "#17becf",
        "#9edae5",
      ],
    },
    data: {
      columns: [],
    },
  };

  _renderChart = (data) => {
    var options = { bindto: this._node };
    _.extend(options, data);
    this.chart = C3.generate(options);
  };

  componentDidMount() {
    this._renderChart(this.props);
  }

  componentWillReceiveProps(newProps) {
    // Should be able to `this.chart.load(newProps)`, but this doesn't work
    this._renderChart(newProps);
  }

  render() {
    return (
      <div ref={(c) => (this._node = c)} className={styles.container}></div>
    );
  }
}

export default DataGraph;
