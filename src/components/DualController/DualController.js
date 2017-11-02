/************************************************************************
 * DualController.js - Two-variable application controller
 * 
 * This controller represents a portal that allows the user to compare 
 * and display two variables at once. It has dropdowns to select a model,
 * experiment, and two seperate variables. 
 * 
 * Its children are DualDataController, which coordinates graphs comparing
 * the two selected variables, and MapController, which coordinates a map
 * displaying one variable as scalar colours and the other as isolines.
 * 
 * The main variable is internally referred to as "variable," the variable
 * being compared to it is internally referred to as "comparand." 
 * Timestamps and available datasets are based on what's available for 
 * the main variable; if the user selects parameters for which the 
 * comparand lacks data, it won't be displayed.
 ************************************************************************/

import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import MapController from '../MapController';
import DualDataController from '../DualDataController/DualDataController';
import Selector from '../Selector';
import AppMixin from '../AppMixin';

var App = React.createClass({

  /*
   * Initial state is set after the multimeta API query run in AppMixin.componentDidMount()
   * State provided by componentDidMount():
   *  - model_id
   *  - variable_id
   *  - experiment
   *  - meta
   */

  mixins: [AppMixin],
  
  //This function filters out datasets inappropriate for this portal. A dataset
  //the filter returns "false" on will be removed.
  //Filters out multi-year monthly datasets; too noisy to be useful.
  datasetFilter: function (datafile) {
    return !(datafile.multi_year_mean == false && datafile.timescale == "monthly");
  },

  //because componentDidMount() is shared by all three App Controllers via a 
  //mixin, it doesn't set the initial state of the comparison variable 
  //(comparand_id), so needs to be initialized seperately here.
  componentDidUpdate: function (prevProps, prevState) {
    if(!this.state.comparand_id) {
      this.setState({
        comparand_id: this.state.variable_id
      });
    }
  },

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
            <Selector label={"Variable #1 (Colour blocks)"} onChange={this.updateSelection.bind(this, 'variable_id')} items={this.getVariableIdNameArray()} value={this.state.variable_id}/>
          </Col>
          <Col lg={3} md={3}>
            <Selector label={"Variable #2 (Isolines)"} onChange={this.updateSelection.bind(this, 'comparand_id')} items={this.getVariableIdNameArray()} value={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div>
              <MapController
                meta = {this.getfilteredMeta()}
                comparandMeta = {this.getfilteredMeta(this.state.comparand_id)}
                onSetArea={this.handleSetArea}
              />
            </div>
          </Col>
          <Col lg={6}>
            <DualDataController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              comparand_id={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}
              experiment={this.state.experiment}
              area={this.state.area}
              meta = {this.getfilteredMeta()}
              comparandMeta = {this.state.comparand_id ? this.getfilteredMeta(this.state.comparand_id) : this.getfilteredMeta()}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});

export default App;
