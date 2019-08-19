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
import axios from 'axios';
import urljoin from 'url-join';
import { timestampToYear } from '../../../core/util';

var findEnsemble = function(props) {
  return (
    (props.match && props.match.params && props.match.params.ensemble_name) ||
    props.ensemble_name ||
    process.env.REACT_APP_CE_ENSEMBLE_NAME
  );
};

export default createReactClass({
  displayName: 'SingleAppController',

  /**
   * Initial state set upon metadata returning in {@link App#componentDidMount}.
   * Includes: - model_id - variable_id - experiment
   */

  ////////////////////////////////////////////////////////////////////
  // mixins: [AppMixin],
  
  getInitialState: function () {
    console.log('### SingleAppController.getInitialState')
    return {
      ensemble_name: findEnsemble(this.props),

      model: undefined,
      scenario: undefined,
      variable: undefined,

      model_id: '',
      variable_id: '',
      variable_name: '',
      experiment: '',

      area: undefined,  // geojson object
      meta: [],
    };
  },

  componentWillReceiveProps: function(nextProps) {
    console.log('### SingleAppController.componentWillReceiveProps')
    this.setState({
      ensemble_name: findEnsemble(nextProps),
    });
  },

  //query, parse, and store metadata for all datasets
  componentDidMount: function () {
    console.log('### SingleAppController.componentDidMount')
    this.updateMetadata();
  },

  updateMetadata: function () {
    console.log('### SingleAppController.updateMetadata')
    var models = [];
    var vars;

    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/124
    axios({
      baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'multimeta'),
      params: { ensemble_name: this.state.ensemble_name },
    }).then(response => {
      for (var key in response.data) {
        vars = Object.keys(response.data[key].variables);

        for (var v in vars) {
          var start = timestampToYear(response.data[key].start_date);
          var end = timestampToYear(response.data[key].end_date);

          // Stopgap measure to deal with the fact that experiment string formats
          // vary between climdex files ("historical, rcp26") and GCM outputs
          // ("historical,rcp26"). Formats experiment strings to include a space.
          // This formatting is undone to run queries against the database by
          // ce-backend.guessExperimentFormatFromVariable()
          // TODO: remove this when no longer needed.
          var normalizedExp = String(response.data[key].experiment).replace(',r', ', r');

          //If this app has a dataset filter defined, filter the data
          if(typeof this.datasetFilter == "undefined" ||
            this.datasetFilter(response.data[key])) {
            models.push(_.extend({
              unique_id: key,
              variable_id: vars[v],
              start_date: start,
              end_date: end,
              experiment: normalizedExp,
              variable_name: response.data[key].variables[vars[v]],
            }, _.omit(response.data[key], 'variables', 'start_date', 'end_date',
              'modtime', 'experiment')));
          }
        }
      }

      // Merge the selection information
      // If a dataset is already selected, use that. Otherwise, use
      // defaults if available. Otherwise, first available.
      // Default dataset: CanESM2, rcp85, pr
      function specifiedIfAvailable(attribute, value, items) {
        return _.map(items, attribute).includes(value) ? value : items[0][attribute];
      }

      const model_id = this.state.model_id ? this.state.model_id :
        specifiedIfAvailable("model_id", "PCIC12", models);
      const experiment = this.state.experiment ? this.state.experiment :
        specifiedIfAvailable("experiment", "historical, rcp85", _.filter(models, {model_id: model_id}));
      const variable_id = specifiedIfAvailable("variable_id", "pr",
        _.filter(models, {model_id: model_id, experiment: experiment}));
      // variable_name has no default, because it must match variable_id.
      const variable_name = _.filter(models, {model_id: model_id, experiment: experiment,
        variable_id: variable_id})[0].variable_name;

      this.setState({
        meta: models,
        model_id,
        variable_id,
        variable_name,
        experiment,
      });
    });
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    console.log('### SingleAppController.shouldComponentUpdate')
    return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
  },

  componentDidUpdate: function(nextProps, nextState) {
    console.log('### SingleAppController.componentDidUpdate')
    // The metadata needs to be updated if the ensemble has changed
    if (nextState.ensemble_name !== this.state.ensemble_name) {
      this.updateMetadata();
    }
  },

  /*
   * Called when user sets an area on the MapController. Propagates the area
   * chosen to a DataController.
   */
  handleSetArea: function (geojson) {
    this.setState({ area: geojson });
  },

  ////////////////////////////////////////////////////////////////////
  
  //This filter controls which datasets are available for viewing on this portal;
  //only datasets the filter returns a truthy value for are available.
  //Filters out noisy multi-year monthly datasets.
  datasetFilter: function (datafile) {
    return !(datafile.multi_year_mean === false && datafile.timescale === 'monthly');
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

  filterMetaBy: function(...optionNames) {
    // Initially, selectors are undefined, and go through a default selection
    // process that eventually settles with a defined value for all of them.
    // Returning a metadata set that is filtered by a partially settled
    // selector set causes problems. This function returns the empty array
    // unless a full set of constraints (derived from selectors) is available.
    const settled = _.allDefined(this.state, ...optionNames);
    if (!settled) {
      return [];
    }
    return flow(
      filter(this.constrainBy(...optionNames)),
      sortBy('unique_id')
    )(this.state.meta);
  },

  render: function () {
    const filteredMeta = this.filterMetaBy('model', 'scenario', 'variable');
    const modelContextMetadata = this.filterMetaBy('scenario', 'variable');

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
              experiment={experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta = {filteredMeta}
              contextMeta={modelContextMetadata} //to generate Model Context graph
            />
          </HalfWidthCol>
        </Row>
      </Grid>

    );
  },
});
