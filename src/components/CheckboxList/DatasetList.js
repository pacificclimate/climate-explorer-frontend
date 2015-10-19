var React = require("react");

var DatasetList = React.createClass({

    render: function () {
        return (
            <div>
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is a really really really really long checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
                <input type="checkbox" /> This is checkbox <br />
            </div>
        );
    }
});

module.exports = DatasetList