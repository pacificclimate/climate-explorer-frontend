var React = require("react/addons");
var m = require("../util.js").merge;
var classNames = require('classnames');

import styles from './PanelOverlay.css';

var PanelOverlay = React.createClass({
    propTypes: {
        maxWidth: React.PropTypes.number,
        maxHeight: React.PropTypes.number,
    },

    getDefaultProps: function() {
        return {
            maxHeight: 200,
            maxWidth: 300,
        };
    },

    getOpenStyle: function() {
        return {
            maxHeight: this.props.maxHeight,
        };
    },

    getInitialState: function() {
        return { open: false };
    },

    handleClick: function(event) {
        this.setState({open: !this.state.open});
    },

    render: function() {
        var containerStyle = {
            maxWidth: this.props.maxWidth,
            maxHeight: this.props.maxHeight
        };

        return (
            <div className={ styles.container } style={ containerStyle }>
            <h3 onClick={ this.handleClick }>{ this.props.title }</h3>
            <div className= { classNames(styles.content, !this.state.open && styles.hidden) }>{this.props.children}</div>
            </div>
        )
    }
});

module.exports = PanelOverlay
