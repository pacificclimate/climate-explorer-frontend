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
import { Col, Grid, Panel, Row } from 'react-bootstrap';
import _ from 'lodash';
import find from 'lodash/fp/find';
import flatMap from 'lodash/fp/flatMap';
import flow from 'lodash/fp/flow';
import flatten from 'lodash/fp/flatten';
import map from 'lodash/fp/map';
import reduce from 'lodash/fp/reduce';
import assign from 'lodash/fp/assign';
import filter from 'lodash/fp/filter';
import sortBy from 'lodash/fp/sortBy';
import get from 'lodash/fp/get';

import SingleMapController from '../../map-controllers/SingleMapController';
import SingleDataController
  from '../../data-controllers/SingleDataController/SingleDataController';
import {
  EmissionsScenarioSelector,
  ModelSelector,
  VariableSelector,
} from 'pcic-react-components';
import VariableDescriptionSelector from '../../VariableDescriptionSelector';
import {
  datasetFilterPanelLabel,
  emissionScenarioSelectorLabel,
  modelSelectorLabel,
  variableSelectorLabel,
} from '../../guidance-content/info/InformationItems';

import AppMixin from '../../AppMixin';
import g from '../../../core/geo';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import FilteredDatasetsSummary
  from '../../data-presentation/FilteredDatasetsSummary';
import FlowArrow from '../../data-presentation/FlowArrow';
import UnfilteredDatasetsSummary
  from '../../data-presentation/UnfilteredDatasetsSummary';

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
  // TODO: Convert!!
  getModelContextMetadata: function () {
    return _.filter(
      this.state.meta,
      {
        variable_id: this.state.variable_id,
        experiment: this.state.experiment
      }
    );
  },

  handleChangeModel: function (model) {
    this.setState({ model });
  },

  replaceInvalidModel: function (options, value) {
    return find({ value: { representative: { model_id: 'PCIC12' }}})(options);
  },

  handleChangeScenario: function (scenario) {
    this.setState({ scenario });
  },

  replaceInvalidScenario: function (options, value) {
    return find(
      opt => opt.value.representative.experiment.includes('rcp85')
    )(options);
  },

  handleChangeVariable: function (variable) {
    this.setState({ variable });
  },

  replaceInvalidVariable: function (options, value) {
    const flatOptions = flatMap('options', options);
    const option = find(opt => !opt.isDisabled)(flatOptions);
    return option;
  },

  representativeValue: function (optionName, valueName) {
    return get([optionName, 'value', 'representative', valueName])(this.state);
  },

  constrainBy: function () {
    // Returns an object containing the union of all representatives of the
    // options named in the arguments (e.g., 'model', 'scenario').
    // Returned object is suitable as a constraint for a
    // `SimpleConstraintGroupingSelector`.
    return flow(
      flatten,
      map(name => this.state[name]),
      map(option => option && option.value.representative),
      reduce((result, value) => assign(result, value), {})
    )(arguments)
  },

  render: function () {
    const filteredMeta = (() => {
      // Initially, selectors are undefined, and go through a default selection
      // process that eventually settles with a defined value for all of them.
      // Returning a metadata set that is filtered by a partially settled
      // selector set causes problems. This function returns the empty array
      // unless a full set of constraints (derived from selectors) is available.
      // TODO: Probably simplify to this.state.x has settled.
      const constraint = this.constrainBy('model', 'scenario', 'variable');
      const hasAllConstraints =
        _.allDefined(constraint, 'model_id', 'experiment', 'variable_id');
      if (!hasAllConstraints) {
        return [];
      }
      return flow(
        filter(constraint),
        sortBy('unique_id')
      )(this.state.meta);
    })();

    const model_id = this.representativeValue('model', 'model_id');
    const experiment = this.representativeValue('scenario', 'experiment');
    const variable_id = this.representativeValue('variable', 'variable_id');

    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125

    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <UnfilteredDatasetsSummary meta={this.state.meta} />
          </FullWidthCol>
        </Row>

        <Row>
          <FullWidthCol>
            <FlowArrow pullUp />
          </FullWidthCol>
        </Row>

        <Row>
          <FullWidthCol>
            <Panel>
              <Panel.Heading>
                <Panel.Title>{datasetFilterPanelLabel}</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col lg={2} md={2}>
                    <ModelSelector
                      bases={this.state.meta}
                      value={this.state.model}
                      onChange={this.handleChangeModel}
                      replaceInvalidValue={this.replaceInvalidModel}
                    />
                  </Col>
                  <Col lg={2} md={2}>
                    <EmissionsScenarioSelector
                      bases={this.state.meta}
                      constraint={this.constrainBy('model')}
                      value={this.state.scenario}
                      onChange={this.handleChangeScenario}
                      replaceInvalidValue={this.replaceInvalidScenario}
                    />
                  </Col>
                  <Col lg={4} md={4}>
                    <VariableSelector
                      bases={this.state.meta}
                      constraint={this.constrainBy('model', 'scenario')}
                      value={this.state.variable}
                      onChange={this.handleChangeVariable}
                      replaceInvalidValue={this.replaceInvalidVariable}
                    />
                  </Col>
                </Row>
              </Panel.Body>
            </Panel>
          </FullWidthCol>
        </Row>

        <Row>
          <FullWidthCol>
            <FlowArrow pullUp />
          </FullWidthCol>
        </Row>

        <Row>
          <FullWidthCol>
            <FilteredDatasetsSummary
              model_id={model_id}
              experiment={experiment}
              variable_id={variable_id}
              meta = {filteredMeta}
            />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <FlowArrow pullUp />
          </HalfWidthCol>
          <HalfWidthCol>
            <FlowArrow pullUp />
          </HalfWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <SingleMapController
              model_id={model_id}
              experiment={experiment}
              variable_id={variable_id}
              meta = {filteredMeta}
              area={this.state.area}
              onSetArea={this.handleSetArea}
            />
          </HalfWidthCol>
          <HalfWidthCol>
            <SingleDataController
              ensemble_name={this.state.ensemble_name}
              model_id={model_id}
              variable_id={variable_id}
              comparand_id={this.state.comparand_id ? this.state.comparand_id : variable_id}
              experiment={experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta = {filteredMeta}
              contextMeta={this.getModelContextMetadata()} //to generate Model Context graph
            />
          </HalfWidthCol>
        </Row>
      </Grid>

    );
  },
});
