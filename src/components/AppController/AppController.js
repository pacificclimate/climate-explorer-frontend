/***************************************************************
 * AppController.js 
 * 
 * This controller represent climate explorer's main portal. It
 * has dropdowns to allow a user to select a model, emission
 * scenario, and variable. It loads and filters metadata for 
 * the selected datasets and passes them to its children:  
 * - MapController (displays a variable as a colour-shaded map) 
 * - DataController (displays graphs and a statistical table).
 ***************************************************************/

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

  getDefaultProps: function () {
    return {
      ensemble_name: CE_ENSEMBLE_NAME
    };
  },

  mixins: [AppMixin],

  //This filter controls which datasets are available for viewing on this portal;
  //only datasets the filter returns a truthy value for are available.
  //Filters out noisy multi-year monthly datasets.
  datasetFilter: function (datafile) {
    return !(datafile.multi_year_mean == false && datafile.timescale == "monthly");
  },

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
