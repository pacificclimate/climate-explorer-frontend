import React from 'react';
import urljoin from 'url-join';
import _ from 'underscore';

import styles from './ExperimentSelector.css';

var ExperimentSelector = React.createClass({

  propTypes: {
    onChange: React.PropTypes.function,
  },

  getInitialState: function () {
    return {
      items: [],
    };
  },

  componentDidMount: function () {
    $.ajax({
      url: urljoin(CE_BACKEND_URL, 'models'),
      crossDomain: true,
    }).done(function (data) {
      this.setState({ items: _.uniq(data) });
    }.bind(this));
  },

  onChange: function (event) {
    this.setState({ value: event.target.value });
    this.props.onChange(event.target.value);
  },

  render: function () {
    return (
      <div className={styles.selector}>
        <select onChange={this.onChange} value={this.state.value}>
          { this.state.items.map(function (item) { return <option key={item}>{item} </option>; }) }
        </select>
      </div>
    );
  },
});

export default ExperimentSelector;
