/************************************************************************
 * StreamflowController.js - Streamflow application controller
 * 
 * This controller is a portal that allows a user to select and visualize
 * routed, site-based stream flow data. It has dropdowns to select a model 
 * and experiment; the variable is always streamflow.
 * 
 * Its children are StreamflowDataController, which generates graphs
 * and tables showing routed flow visualization, and MapController, which
 * allows selection of stations and visualization of watersheds.
 * 
 * When the user selects a station on the MapController, the station is 
 * passed up to this component, which then passes it down to the 
 * StreamflowDataController to load and display data from that station. 
 ************************************************************************/

import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import MapController from '../MapController';
import StreamflowDataController from '../StreamflowDataController/StreamflowDataController';
import Selector from '../Selector';
import AppMixin from '../AppMixin';

var App = React.createClass({

  /**
   * Initial state set upon metadata returning in {@link App#componentDidMount}.
   * Includes: 
   * - model_id 
   * - variable_id 
   */

  getInitialState: function () {
    return {
      metadataQuery: "streamflow/multistation",
      selectedStations: []
    };
  },
  
  handleSetStation: function(stations) {
    console.log("handleSetStation in SteamflowController");
    this.setState({
      selectedStations: stations
    });
  },

  mixins: [AppMixin],

  render: function () {
    return (
      <Grid fluid>
        <Row>
          <Col lg={4} md={4}>
            <Selector label={"Model Selection"} onChange={this.updateSelection.bind(this, 'model_id')} items={this.getMetadataItems('model_id')} value={this.state.model_id}/>
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
                onSetStation={this.handleSetStation}
              />
            </div>
          </Col>
          <Col lg={6}>
            <StreamflowDataController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              experiment={this.state.experiment}
              area={this.state.area}
              stations={this.state.selectedStations}
              meta = {this.getfilteredMeta()}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});

export default App;
