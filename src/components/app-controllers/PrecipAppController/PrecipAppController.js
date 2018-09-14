/************************************************************************
 * PrecipAppController.js - Extreme precipitation application controller
 * 
 * This controller represents a portal that serves information on extreme
 * precipitation. It is meant to be used with an ensemble containing 
 * GCM pr outputs as well as climdex indices relating to precipitation. 
 * The user selects a model, experiment, and climdex variable, which is
 * then compared to precipitation values.
 * 
 * Its children are DualDataController, which coordinates graphs comparing
 * the two selected variables, and PrecipMapController, which coordinates
 * a map displaying the selected climdex as a raster and precipitation as 
 * annotated isolines.
 * 
 * It is very similar to the DualController, except the comparison variable
 * is always precipitation.
 ************************************************************************/

import React from 'react';
import createReactClass from 'create-react-class';
import { Grid, Row, Col } from 'react-bootstrap';

import DualDataController from '../../data-controllers/DualDataController/DualDataController';
import Selector from '../../Selector';
import VariableDescriptionSelector from '../../VariableDescriptionSelector';
import {
  modelSelectorLabel, emissionScenarioSelectorLabel, variableSelectorLabel
} from '../../guidance-content/info/LabelWithInfoItems';

import AppMixin from '../../AppMixin';
import g from '../../../core/geo';
import PrecipMapController from '../../map-controllers/PrecipMapController';
import _ from 'underscore';

export default createReactClass({
  displayName: 'PrecipAppController',

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
    return !(datafile.multi_year_mean === false && datafile.timescale == "monthly");
  },

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  render: function () {

    //hierarchical data selection: model, then experiment, then variable
    const modOptions = this.getMetadataItems('model_id');
    const expOptions = this.markDisabledMetadataItems(this.getMetadataItems('experiment'),
        this.getFilteredMetadataItems('experiment', {model_id: this.state.model_id}));
    
    return (
      <Grid fluid>
        <Row>
          <Col lg={3} md={3}>
            <Selector 
              label={modelSelectorLabel}
              onChange={this.updateSelection.bind(this, 'model_id')}
              items={modOptions}
              value={this.state.model_id}
            />
          </Col>
            <Col lg={3} md={3}>
            <Selector
              label={emissionScenarioSelectorLabel}
              onChange={this.updateSelection.bind(this, 'experiment')}
              items={expOptions}
              value={this.state.experiment}
            />
          </Col>
          <Col lg={3} md={3}>
            <VariableDescriptionSelector
              label={variableSelectorLabel}
              onChange={this.handleSetVariable.bind(this, "variable")}
              meta={_.filter(this.state.meta, m=> {return m.variable_id != "pr"})}
              constraints={_.pick(this.state, "model_id", "experiment")}
              value={_.pick(this.state, "variable_id", "variable_name")} 
            />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <PrecipMapController
              variable_id={this.state.variable_id}
              meta = {this.getFilteredMeta()}
              comparand_id={"pr"}
              comparandMeta = {this.getFilteredMeta("pr", "Precipitation")}
              area={this.state.area}
              onSetArea={this.handleSetArea}
            />
          </Col>
          <Col lg={6}>
            <DualDataController
              ensemble_name={this.state.ensemble_name}
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              comparand_id={"pr"}
              experiment={this.state.experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta = {this.getFilteredMeta()}
              comparandMeta = {this.getFilteredMeta("pr")}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});