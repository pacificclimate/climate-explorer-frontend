var React = require("react");

var CheckboxItem = React.createClass({
    propTypes: {
        label: React.PropTypes.string.isRequired,
        isChecked: React.PropTypes.bool,
        onChange: React.PropTypes.func
    },

    getDefaultProps: function () {
        return {
            isChecked: false
        };
    },

    render: function () {
        return (
            <div>
                <label>
                    <input
                    ref="checkbox"
                    type="checkbox"
                    defaultChecked={this.props.isChecked}
                    onChange={this.props.onChange} />
                    {this.props.label}
                </label>
            </div>
        );
    }
});

module.exports = CheckboxItem