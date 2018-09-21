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
import { Grid, Row, Col, Panel } from 'react-bootstrap';

import DualDataController from '../../data-controllers/DualDataController/DualDataController';
import Selector from '../../Selector';
import VariableDescriptionSelector from '../../VariableDescriptionSelector';
import {
  modelSelectorLabel, emissionScenarioSelectorLabel, variableSelectorLabel,
  datasetFilterPanelLabel
} from '../../guidance-content/info/InformationItems';

import AppMixin from '../../AppMixin';
import g from '../../../core/geo';
import PrecipMapController from '../../map-controllers/PrecipMapController';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import DatasetsSummary from '../../data-presentation/DatasetsSummary';


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

    const filteredMeta = this.getFilteredMeta();

    const comparand_id = 'pr';
    const comparand_name = 'Precipitation';
    const filteredComparandMeta = this.getFilteredMeta(comparand_id, comparand_name);

    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <Panel>
              <Panel.Heading>
                <Panel.Title>{datasetFilterPanelLabel}</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col lg={2} md={2}>
                    <Selector
                      label={modelSelectorLabel}
                      onChange={this.updateSelection.bind(this, 'model_id')}
                      items={modOptions}
                      value={this.state.model_id}
                    />
                  </Col>
                    <Col lg={2} md={2}>
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
                      onChange={this.handleSetVariable.bind(this, "variable")}
                      meta={_.filter(this.state.meta, m=> {return m.variable_id != "pr"})}
                      constraints={_.pick(this.state, "model_id", "experiment")}
                      value={_.pick(this.state, "variable_id", "variable_name")}
                    />
                  </Col>
                </Row>
              </Panel.Body>
            </Panel>
          </FullWidthCol>
        </Row>
        <Row>
          <FullWidthCol>
            <DatasetsSummary
              model_id={this.state.model_id}
              experiment={this.state.experiment}
              variable_id={this.state.variable_id}
              comparand_id={comparand_id}
              meta={filteredMeta}
              comparandMeta={filteredComparandMeta}
              dual
            />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <PrecipMapController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              experiment={this.state.experiment}
              meta = {filteredMeta}
              comparand_id={comparand_id}
              comparandMeta = {filteredComparandMeta}
              area={this.state.area}
              onSetArea={this.handleSetArea}
            />
          </HalfWidthCol>
          <HalfWidthCol>
            <DualDataController
              ensemble_name={this.state.ensemble_name}
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              comparand_id={comparand_id}
              experiment={this.state.experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta = {filteredMeta}
              comparandMeta = {filteredComparandMeta}
            />
          </HalfWidthCol>
        </Row>
      </Grid>

    );
  },
});