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
import createReactClass from 'create-react-class';
import { Grid, Row, Col } from 'react-bootstrap';

import DualDataController from '../DualDataController/DualDataController';
import Selector from '../Selector';
import AppMixin from '../AppMixin';
import g from '../../core/geo';
import DualMapController from '../MapController/DualMapController';
import _ from 'underscore';

var App = createReactClass({
  displayName: 'App',

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
  //mixin, it doesn't set the initial state of DualController's unique comparison
  //variable (comparand_id), which is handled seperately here.
  componentDidUpdate: function (prevProps, prevState) {
    if(!this.state.comparand_id) {//comparand uninitialized
      this.setState({
        comparand_id: this.state.variable_id
      });
    }
    else if(!_.contains(_.pluck(this.state.meta, "variable_id"), this.state.comparand_id)) {
      //comparand leftover from previous ensemble; not present in current one
      this.setState({
        comparand_id: this.state.variable_id
      });
    }
  },

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  render: function () {
    //hierarchical data selection: model, then experiment, then variable(s)
    var modOptions = this.getMetadataItems('model_id');
    var expOptions = this.markDisabledMetadataItems(this.getMetadataItems('experiment'),
        this.getFilteredMetadataItems('experiment', {model_id: this.state.model_id}));
    var varOptions = this.markDisabledMetadataItems(this.getVariableIdNameArray(),
        this.getFilteredMetadataItems('variable_id', {model_id: this.state.model_id, experiment: this.state.experiment}));

    return (
      <Grid fluid>
        <Row>
          <Col lg={3} md={3}>
            <Selector label={"Model Selection"} onChange={this.updateSelection.bind(this, 'model_id')} items={modOptions} value={this.state.model_id}/>
          </Col>
            <Col lg={3} md={3}>
            <Selector label={"Emission Scenario Selection"} onChange={this.updateSelection.bind(this, 'experiment')} items={expOptions} value={this.state.experiment}/>
          </Col>
          <Col lg={3} md={3}>
            <Selector label={"Variable #1 (Colour blocks)"} onChange={this.updateSelection.bind(this, 'variable_id')} items={varOptions} value={this.state.variable_id}/>
          </Col>
          <Col lg={3} md={3}>
            <Selector label={"Variable #2 (Isolines)"} onChange={this.updateSelection.bind(this, 'comparand_id')} items={varOptions} value={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div style={{ width: 890, height: 700 }}>
              <DualMapController
                meta = {this.getfilteredMeta()}
                comparandMeta = {this.getfilteredMeta(this.state.comparand_id)}
                area={this.state.area}
                onSetArea={this.handleSetArea}
              />
            </div>
          </Col>
          <Col lg={6}>
            <DualDataController
              ensemble_name={this.state.ensemble_name}
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              comparand_id={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}
              experiment={this.state.experiment}
              area={g.geojson(this.state.area).toWKT()}
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
