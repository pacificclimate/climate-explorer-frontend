import PropTypes from "prop-types";
import React from "react";
import BootstrapSlider from "bootstrap-slider";

export default class Slider extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.number.isRequired,
    ticks: PropTypes.array,
    ticksLabels: PropTypes.array,
    ticksPositions: PropTypes.array,
    toolTip: PropTypes.bool,
    selection: PropTypes.string,
    onSlide: PropTypes.func,
    onSlideStop: PropTypes.func,
  };

  static defaultProps = {
    id: "",
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    ticks: [],
    ticksLabels: [],
    ticksPositions: [],
    toolTip: false,
    selection: "none",
    onSlideStop: function (event) {
      console.log(event);
    },
  };

  sliderNode = React.createRef();

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.slider.setValue(this.props.value);
    }
  }

  componentDidMount() {
    var toolTip = this.props.toolTip ? "show" : "hide";
    var slider = (this.slider = new BootstrapSlider(this.sliderNode.current, {
      id: this.props.id,
      min: this.props.min,
      max: this.props.max,
      step: this.props.step,
      value: this.props.value,
      ticks: this.props.ticks,
      ticks_labels: this.props.ticksLabels,
      ticks_positions: this.props.ticksPositions,
      tooltip: toolTip,
      selection: this.props.selection,
    }));

    slider.on(
      "slideStop",
      function (event) {
        this.props.onSlideStop(event);
        this.slider.setValue(event);
      }.bind(this),
    );
  }

  componentWillUnmount() {
    this.slider.destroy();
  }

  render() {
    return <div ref={this.sliderNode} style={{ width: "100%" }} />;
  }
}
