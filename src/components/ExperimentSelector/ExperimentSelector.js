import PropTypes from 'prop-types';
import React from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import axios from 'axios';

import styles from './ExperimentSelector.css';

class ExperimentSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.function,
  };

  state = {
    items: [],
  };

  componentDidMount() {
    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/124
    axios({
      baseURL: urljoin(CE_BACKEND_URL, 'models'),
    }).then(response => {
      this.setState({ items: _.uniq(response.data) });
    });
  }

  onChange = (event) => {
    this.setState({ value: event.target.value });
    this.props.onChange(event.target.value);
  };

  render() {
    return (
      <div className={styles.selector}>
        <select onChange={this.onChange} value={this.state.value}>
          { this.state.items.map(function (item) { return <option key={item}>{item} </option>; }) }
        </select>
      </div>
    );
  }
}

export default ExperimentSelector;