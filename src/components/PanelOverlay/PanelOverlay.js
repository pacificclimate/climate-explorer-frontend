var React = require('react');
var classNames = require('classnames');

import styles from './PanelOverlay.css';

var PanelOverlay = React.createClass({
  propTypes: {
    maxWidth: React.PropTypes.number,
    maxHeight: React.PropTypes.number,
    align: React.PropTypes.string,
  },

  getDefaultProps: function () {
    return {
      maxHeight: 200,
      maxWidth: 300,
      align: 'left',
      initialOpen: false,
      keepOpen: false,
    };
  },

  getInitialState: function () {
    if (this.props.keepOpen) {
      return { open: true };
    } else {
      return { open: this.props.initialOpen };
    }
  },

  handleClick: function (event) {
    this.setState({ open: !this.state.open });
  },

  render: function () {
    var containerStyle = {
      maxWidth: this.props.maxWidth,
      maxHeight: this.props.maxHeight
    };

    var contentStyle = {
      maxHeight: this.props.maxHeight - 66 // Bootstrap margin-top 20px, margin-bottom 10px + (h3 height 24px) * 1.1 line height + 10px spacing
    };

    return (
            <div className={ classNames(styles.container, styles[this.props.align]) } style={ containerStyle }>
            <h3 onClick={ this.props.keepOpen ? null : this.handleClick }>{ this.props.title }</h3>
            <div className={ classNames(styles.content, !this.state.open && styles.hidden) }
                style={ contentStyle }>{this.props.children}
            </div>
            </div>
        );
  }
});

module.exports = PanelOverlay;
