import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import MapController from '../MapController';
import DataController from '../DataController/DataController';
import Selector from '../Selector';
import AppMixin from '../AppMixin';

var App = React.createClass({

  /**
   * Initial state set upon metadata returning in {@link App#componentDidMount}.
   * Includes: - model_id - variable_id - experiment
   */

  mixins: [AppMixin],

  render: function () {
    return (
      <Grid fluid>
        <Row>
          <Col lg={4} md={4}>
            <Selector label={"Model Selection"} onChange={this.updateSelection.bind(this, 'model_id')} items={this.getMetadataItems('model_id')} value={this.state.model_id}/>
          </Col>
          <Col lg={4} md={4}>
            <Selector label={"Variable Selection"} onChange={this.updateSelection.bind(this, 'variable_id')} items={this.getVariableIdNameArray()} value={this.state.variable_id}/>
          </Col>
          <Col lg={4} md={4}>
            <Selector label={"Emission Scenario Selection"} onChange={this.updateSelection.bind(this, 'experiment')} items={this.getMetadataItems('experiment')} value={this.state.experiment}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div>
              <MapController
                meta = {this.getfilteredMeta()}
                onSetArea={this.handleSetArea}
              />
            </div>
          </Col>
          <Col lg={6}>
            <DataController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              experiment={this.state.experiment}
              area={this.state.area}
              meta = {this.getfilteredMeta()}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});

export default App;
