import PropTypes from 'prop-types';
import React from 'react';

import DataGraph from '../DataGraph/DataGraph';
import {
  displayError,
  noDataMessageGraphSpec,
  blankGraphSpec,
} from '../graph-helpers';
import { validateLongTermAverageData } from '../../../core/util';
import { getData } from '../../../data-services/ce-backend';


// This component renders a "spaghetti plot" to provide context for the
// selected dataset amongst all equivalent datasets from other models.
// The context graph shows the same data as the long-term average graph,
// but for all models.
//
// The component is generalized by two function props, `getMetadata`
// and `dataToGraphSpec`, which respectively return metadata describing the
// the datasets to display, and return a graph spec for the graph proper.

export default class ContextGraph extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    contextMeta: PropTypes.array,
    // It's not clear this prop is required, except possibly to inform
    // `componentDidUpdate`.
    getMetadata: PropTypes.func,
    // `getMetadata` returns the metadata describing the datasets to
    // be displayed in this component.
    // A different function is passed by different clients to specialize
    // this general component to particular cases (single vs. dual controller).
    dataToGraphSpec: PropTypes.func,
    // `dataToGraphSpec` converts data a graph spec.
    // A different function is passed by different clients to specialize
    // this general component to particular cases (single vs. dual controller).
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
    this.loadGraph();
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
      nextProps.experiment === this.props.experiment &&
      nextProps.area === this.props.area
    ) {
      this.setState({
        graphSpec: this.props.dataToGraphSpec(
          this.metadatas, this.data, this.props.model_id),
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      // Note omission of model_id: This graph doesn't need to reload if model
      // doesn't change. See `componentWillReceiveProps`.
      prevProps.variable_id !== this.props.variable_id ||
      prevProps.experiment !== this.props.experiment ||
      prevProps.contextMeta !== this.props.contextMeta ||  // TODO: Necessary?
      prevProps.area !== this.props.area
    ) {
      this.loadGraph();
    }
  }

  render() {
    return (
      <DataGraph {...this.state.graphSpec}/>
    );
  }
}
