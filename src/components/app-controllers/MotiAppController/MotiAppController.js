/******************************************************************
 * MotiAppController.js - Ensemble-vewing app controller
 * 
 * This controller is intended to be used with an ensemble containing
 * a small number of datasets, each of which is the average of 
 * multiple runs and models, controlled with a lightweight and simple UI.
 * 
 * Users can select a variable and an emissions scenario to view, and see
 * data and maps displaying the mean of all models and runs with that
 * variable and scenario. 
 * 
 * Its children are MotiDataController, which displays graphs and 
 * stats with no user interaction supported, and SingleMapController,
 * which displays the selected ensemble average as a colour-coded
 * raster map.
 ******************************************************************/

import React from 'react';
import createReactClass from 'create-react-class';
import { Grid, Row, Col } from 'react-bootstrap';

import SingleMapController from '../../map-controllers/SingleMapController/SingleMapController';
import MotiDataController from '../../data-controllers/MotiDataController';
import Selector from '../../Selector';
import VariableDescriptionSelector from '../../VariableDescriptionSelector';
import AppMixin from '../../AppMixin';
import g from "../../../core/geo";


export default createReactClass({
  displayName: 'MotiAppController',

  /**
   * Initial state set upon metadata returning in {@link App#componentDidMount}.
   * Includes: - model_id - variable_id - experiment
   */

  mixins: [AppMixin],

  //This function is used to filter which datasets will be used by this
  //portal. Datasets the filter returns "false" on will not be added to
  //the set of available datasets. Filters out noisy monthly non-mean datasets.
  datasetFilter: function (datafile) {
    return !(datafile.multi_year_mean == false && datafile.timescale == "monthly");
  },

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  render: function () {
    //hierarchical selections: model (implicit), then variable, then emission
    var expOptions = this.markDisabledMetadataItems(this.getMetadataItems('experiment'),
        this.getFilteredMetadataItems('experiment', {model_id: this.state.model_id, variable_id: this.state.variable_id}));

    return (
      <Grid fluid>
        <Row>
          <Col lg={2} md={2}>
            <VariableDescriptionSelector
              label={"Variable Selection"}
              onChange={this.handleSetVariable.bind(this, "variable")}
              meta={this.state.meta}
              constraints={{model_id: this.state.model_id}}
              value={_.pick(this.state, "variable_id", "variable_name")} 
            />
          </Col>
          <Col lg={2} md={2}>
            <Selector
              label={"Emission Scenario Selection"}
              onChange={this.updateSelection.bind(this, 'experiment')}
              items={expOptions}
              value={this.state.experiment}
            />
          </Col>
          <Col lg={8} md={8}>
            <SingleAppHeading {...this.state} />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <SingleMapController
              variable_id={this.state.variable_id}
              meta = {this.getFilteredMeta()}
              area={this.state.area}
              onSetArea={this.handleSetArea}
            />
          </Col>
          <Col lg={6}>
            <MotiDataController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              experiment={this.state.experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta = {this.getFilteredMeta()}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});