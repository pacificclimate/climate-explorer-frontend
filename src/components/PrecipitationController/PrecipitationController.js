/************************************************************************
 * PrecipitationController.js - Extreme precipitation application controller
 * 
 * This controller represents a portal that serves information on extreme
 * precipitation. It is meant to be used with an ensemble containing 
 * GCM pr outputs as well as climdex indices relating to precipitation. 
 * The user selects a model, experiment, and climdex variable, which is
 * then compared to precipitation values.
 * 
 * Its children are DualDataController, which coordinates graphs comparing
 * the two selected variables, and MapController, which coordinates a map
 * displaying the climdex as scalar colours and precipitation as isolines.
 * 
 * It is very similar to the DualController, except the comparison variable
 * is always precipitation.
 ************************************************************************/

import React from 'react';
import createReactClass from 'create-react-class';
import { Grid, Row, Col } from 'react-bootstrap';

import DualDataController from '../DualDataController/DualDataController';
import Selector from '../Selector';
import AppMixin from '../AppMixin';
import g from '../../core/geo';
import MapController from '../MapController';
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

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  render: function () {
    //hierarchical data selection: model, then experiment, then variable
    var modOptions = this.getMetadataItems('model_id');
    var expOptions = this.markDisabledMetadataItems(this.getMetadataItems('experiment'),
        this.getFilteredMetadataItems('experiment', {model_id: this.state.model_id}));
    var varOptions = this.markDisabledMetadataItems(this.getVariableIdNameArray(),
        this.getFilteredMetadataItems('variable_id', {model_id: this.state.model_id, experiment: this.state.experiment}));
    varOptions = _.filter(varOptions, function(option) {return option[0] != "pr"});

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
            <Selector label={"Variable Selection"} onChange={this.updateSelection.bind(this, 'variable_id')} items={varOptions} value={this.state.variable_id}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div style={{ width: 890, height: 700 }}>
              <MapController
                meta = {this.getfilteredMeta()}
                comparandMeta = {this.getfilteredMeta("pr")}
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
              comparand_id={"pr"}
              experiment={this.state.experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta = {this.getfilteredMeta()}
              comparandMeta = {this.getfilteredMeta("pr")}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});

export default App;
