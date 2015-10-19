var React = require("react/addons");
var m = require("../util.js").merge;

var styles = {
    root: {
        position: 'relative',
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 5,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: '0px 10px 10px 0px',
        float: 'left',
        clear: 'left',
        backgroundColor: '#333',
        color: '#DDD',
    },

    hidden: {
        display: 'none',
    },

    content: {
        overflowY: 'auto',
    }
};

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
        var containerStyle = m(styles.root,
        {
            maxWidth: this.props.maxWidth,
            maxHeight: this.props.maxHeight
        }
        );

        return (
            <div className='' style={containerStyle}>
            <h3 onClick={ this.handleClick }>{this.props.title}</h3>
            <div style={m(styles.content,
                !this.state.open && styles.hidden)}>{this.props.children}</div>
            </div>
        )
    }
});

module.exports = PanelOverlay
