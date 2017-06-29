import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import DualMapController from '../DualMapController';
import DualDataController from '../DualDataController/DualDataController';
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
          <Col lg={3} md={3}>
            <Selector label={"Model Selection"} onChange={this.updateSelection.bind(this, 'model_id')} items={this.getMetadataItems('model_id')} value={this.state.model_id}/>
          </Col>
            <Col lg={3} md={3}>
            <Selector label={"Emission Scenario Selection"} onChange={this.updateSelection.bind(this, 'experiment')} items={this.getMetadataItems('experiment')} value={this.state.experiment}/>
          </Col>
          <Col lg={3} md={3}>
            <Selector label={"Variable #1 (Color blocks)"} onChange={this.updateSelection.bind(this, 'variable_id')} items={this.getVariableIdNameArray()} value={this.state.variable_id}/>
          </Col>
          <Col lg={3} md={3}>
            <Selector label={"Variable #2 (Isolines)"} onChange={this.updateSelection.bind(this, 'variable2_id')} items={this.getVariableIdNameArray()} value={this.state.variable2_id ? this.state.variable2_id : this.state.variable_id}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div>
              <DualMapController
                meta = {this.getfilteredMeta()}
                comparandMeta = {this.getfilteredMeta2()}
                onSetArea={this.handleSetArea}
              />
            </div>
          </Col>
          <Col lg={6}>
            <DualDataController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              variable2_id={this.state.variable2_id ? this.state.variable2_id : this.state.variable_id}
              experiment={this.state.experiment}
              area={this.state.area}
              meta = {this.getfilteredMeta()}
              meta2 = {this.state.variable2_id ? this.getfilteredMeta2() : this.getfilteredMeta()}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});

export default App;
