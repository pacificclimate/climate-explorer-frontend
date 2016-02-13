var React = require('react');

var DynamicSearch = React.createClass({

  // sets initial state
  getInitialState: function () {
    return { searchString: '' };
  },

  // sets state, triggers render method
  handleChange: function (event) {
    // grab value form input box
    this.setState({ searchString:event.target.value });
  },

  render: function () {

    var datasets = this.props.items;
    var searchString = this.state.searchString.trim().toLowerCase();

    // filter datasets list by value from input box
    if(searchString.length > 0) {
      datasets = datasets.filter(function (dataset) {
        return dataset.name.toLowerCase().match(searchString);
      });
    }

    return (
      <div>
        <input type="text" value={this.state.searchString} onChange={this.handleChange} placeholder="Search Datasets" />
        <ul>
          { datasets.map(function (dataset) { return <li>{dataset.name} </li>; }) }
        </ul>
      </div>
    );
  }

});

module.exports = DynamicSearch;
