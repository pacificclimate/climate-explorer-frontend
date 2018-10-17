import PropTypes from 'prop-types';
import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { multiYearMeanSelected } from '../../graphs/graph-helpers';

const graphTabSpecPropType = PropTypes.shape({
  title: PropTypes.node,
  graph: PropTypes.element,
});
import styles from '../DataController.css';


export default class GraphTabs extends React.Component {
  static propTypes = {
    model_id: PropTypes.string.isRequired,
    variable_id: PropTypes.string.isRequired,
    experiment: PropTypes.string.isRequired,
    meta: PropTypes.array.isRequired,
    specs: PropTypes.shape({
      mym: graphTabSpecPropType.isRequired,
      notMym: graphTabSpecPropType.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    // Convert graph tabs spec to list of tabs.
    const graphTabs =
      this.props.specs[multiYearMeanSelected(this.props) ? 'mym' : 'notMym']
      .map(
        (spec, i) => {
          const Graph = spec.graph;
          return (
            <Tab
              eventKey={i} title={spec.title}
              className={styles.data_panel}
            >
              <Graph {...this.props}/>
            </Tab>
          );
        }
      );

    return (
      <Tabs id='Graphs'>
        {graphTabs}
      </Tabs>
    );
  }
}
