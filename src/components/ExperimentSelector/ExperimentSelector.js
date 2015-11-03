import React, { Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';

import styles from './ExperimentSelector.css';

class ExperimentSelector extends Component {

  constructor(props) {
    super(props);
    this.state = {
      items: []
    }
  }

  componentDidMount() {
    $.ajax({
      url: urljoin(CE_BACKEND_URL, 'models'),
      crossDomain: true
    }).done(function(data) {
      data = _.uniq(data);
      this.setState({ items: data });
    }.bind(this));
  };

  render() {
    return (
      <div className={styles.selector}>
        <select>
          { this.state.items.map(function(item){ return <option key={item}>{item} </option> }) }
        </select>
      </div>
    );
  }
}

export default ExperimentSelector;