import PropTypes from 'prop-types';
import React from 'react';

import DataGraph from '../../DataGraph/DataGraph';
import {
  blankGraphSpec,
  displayError,
  noDataMessageGraphSpec,
} from '../../../core/data-controller-helpers';
import { validateLongTermAverageData } from '../../../core/util';
import { getData } from '../../../data-services/ce-backend';


export default class ContextGraph extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    contextMeta: PropTypes.array,
    getMetadata: PropTypes.func,
    dataToGraphSpec: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      graphSpec: blankGraphSpec,
    };
  }

  displayNoDataMessage = (message) => {
    //Removes all data from the graph and displays a message
    this.setState({
      graphSpec: noDataMessageGraphSpec(message),
    });
  };

  getAndValidateTimeseries(metadata) {
    return (
      getData(metadata)
        .then(validateLongTermAverageData)
        .then(response => response.data)
    );
  }

  loadGraph() {
    this.displayNoDataMessage('Loading Data');

    const metadatas = this.props.getMetadata().filter(metadata => !!metadata);
    const timeseriesPromises = metadatas.map(metadata =>
      this.getAndValidateTimeseries(metadata)
    );

    Promise.all(timeseriesPromises).then(data => {
      this.metadatas = metadatas;
      this.data = data;
      this.setState({
        graphSpec: this.props.dataToGraphSpec(metadatas, data, this.props.model_id),
      });
    }).catch(error => {
      displayError(error, this.displayNoDataMessage);
    });
  }

  // Lifecycle hooks

  componentDidMount() {
    this.loadGraph(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // If we are already displaying data, and if only the model_id has
    // changed, then we don't need to get data again; we only need to
    // regenerate the graph from it (to emphasize the current model).
    // This code coordinates with `this.props.getMetadata`, and so may be
    // better defined externally and passed as a prop (`updatedGraphSpec`,
    // returning new graph spec?).
    // Leave it here for now.
    if (
      this.state.graphSpec &&
      this.state.graphSpec.data.columns.length > 0 &&
      nextProps.variable_id === this.props.variable_id &&
      nextProps.experiment === this.props.experiment
    ) {
      this.setState({
        graphSpec: this.props.dataToGraphSpec(
          this.metadatas, this.data, this.props.model_id),
      });
    }
  }

  // TODO: Add shouldComponentUpdate? Logic from componentDidUpdate?

  componentDidUpdate(prevProps, prevState) {
    if (
      // Note omission of model_id: This graph doesn't need to reload if model
      // doesn't change
      prevProps.variable_id !== this.props.variable_id ||
      prevProps.experiment !== this.props.experiment ||
      prevProps.contextMeta !== this.props.contextMeta ||  // TODO: Necessary?
      prevProps.area !== this.props.area
    ) {
      this.loadGraph(this.props);
    }
  }

  render() {
    return (
      <DataGraph {...this.state.graphSpec}/>
    );
  }
}
