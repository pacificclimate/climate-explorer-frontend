/***************************************************************
 * SingleAppController.js 
 * 
 * This controller represent climate explorer's main portal. It
 * has dropdowns to allow a user to select a model, emission
 * scenario, and variable. It loads and filters metadata for 
 * the selected datasets and passes them to its children:  
 * - SingleMapController (displays a variable as a colour-shaded map) 
 * - SingleDataController (displays graphs and a statistical table).
 ***************************************************************/

import React from 'react';
import createReactClass from 'create-react-class';
import { Grid, Row, Col } from 'react-bootstrap';
import _ from 'underscore';

import styles from '../AppController.css';
import SingleMapController from '../../map-controllers/SingleMapController';
import SingleDataController from '../../data-controllers/SingleDataController/SingleDataController';
import Selector from '../../Selector';
import VariableDescriptionSelector from '../../VariableDescriptionSelector';
import {
  modelSelectorLabel, emissionScenarioSelectorLabel, variableSelectorLabel
} from '../../help-etc/LabelWithInfoItems';

import AppMixin from '../../AppMixin';
import g from '../../../core/geo';

export default createReactClass({
  displayName: 'SingleAppController',

  /**
   * Initial state set upon metadata returning in {@link App#componentDidMount}.
   * Includes: - model_id - variable_id - experiment
   */

  mixins: [AppMixin],

  //This filter controls which datasets are available for viewing on this portal;
  //only datasets the filter returns a truthy value for are available.
  //Filters out noisy multi-year monthly datasets.
  datasetFilter: function (datafile) {
    return !(datafile.multi_year_mean === false && datafile.timescale === 'monthly');
  },

  //Returns metadata for datasets with thethe selected variable + scenario, any model.
  //Passed as a prop for SingleDataController to generate model comparison graphs.
  getModelContextMetadata: function () {
    return _.where(this.state.meta,
        { variable_id: this.state.variable_id, experiment: this.state.experiment });
  },

  render: function () {
    //hierarchical selection: model, then variable, then experiment
    var modOptions = this.getMetadataItems('model_id');
    var expOptions = this.markDisabledMetadataItems(this.getMetadataItems('experiment'),
        this.getFilteredMetadataItems('experiment', { model_id: this.state.model_id, variable_id: this.state.variable_id }));

    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
    return (
      <Grid fluid>
        <Row>
          <Col lg={4} md={4}>
            <Selector
              label={modelSelectorLabel}
              onChange={this.updateSelection.bind(this, 'model_id')}
              items={modOptions}
              value={this.state.model_id}
            />
          </Col>
          <Col lg={4} md={4}>
            <Selector
              label={emissionScenarioSelectorLabel}
              onChange={this.updateSelection.bind(this, 'experiment')}
              items={expOptions}
              value={this.state.experiment}
            />
          </Col>
          <Col lg={4} md={4}>
            <VariableDescriptionSelector
              label={variableSelectorLabel}
              onChange={this.handleSetVariable.bind(this, 'variable')}
              meta={this.state.meta}
              constraints={{ model_id: this.state.model_id }}
              value={_.pick(this.state, 'variable_id', 'variable_name')}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div className={styles.mapcontroller}>
              <SingleMapController
                variable_id={this.state.variable_id}
                meta = {this.getFilteredMeta()}
                area={this.state.area}
                onSetArea={this.handleSetArea}
              />
            </div>
          </Col>
          <Col lg={6}>
            <SingleDataController
              ensemble_name={this.state.ensemble_name}
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              comparand_id={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}
              experiment={this.state.experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta = {this.getFilteredMeta()}
              contextMeta={this.getModelContextMetadata()} //to generate Model Context graph
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});
