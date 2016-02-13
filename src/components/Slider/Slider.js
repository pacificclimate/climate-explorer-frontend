var React = require('react');
var ReactDOM = require('react-dom');
var BootstrapSlider = require('bootstrap-slider');

var Slider = React.createClass({

  propTypes: {
    id: React.PropTypes.string,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    value: React.PropTypes.number.isRequired,
    ticks: React.PropTypes.array,
    ticksLabels: React.PropTypes.array,
    ticksPositions: React.PropTypes.array,
    toolTip: React.PropTypes.bool,
    selection: React.PropTypes.string,
    onSlide: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      id: '',
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      ticks: [],
      ticksLabels: [],
      ticksPositions: [],
      toolTip: false,
      selection: 'none',
      onSlideStop: function (event) {
        console.log(event);
      }
    };
  },

  componentWillUpdate: function (nextProps, nextState) {
    this.slider.setValue(nextProps.value);
  },

  componentDidMount: function () {
    var toolTip = this.props.toolTip ? 'show' : 'hide';
    var slider = this.slider = new BootstrapSlider(ReactDOM.findDOMNode(this), {
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
    });

    slider.on('slideStop', function (event) {
      this.props.onSlideStop(event);
      this.slider.setValue(event);
    }.bind(this));
  },

  render: function () {
    return (
            <div style={{ width: '100%' }} />
        );
  }
});

module.exports = Slider;
