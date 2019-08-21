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
import { Col, ControlLabel, Grid, Panel, Row } from 'react-bootstrap';
import Loader from 'react-loader';

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

import g from '../../../core/geo';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import FilteredDatasetsSummary
  from '../../data-presentation/FilteredDatasetsSummary';
import FlowArrow from '../../data-presentation/FlowArrow';
import UnfilteredDatasetsSummary
  from '../../data-presentation/UnfilteredDatasetsSummary';
import { getMetadata } from '../../../data-services/ce-backend';

// TODO: Extract to utility module.
function ensemble_name(props) {
  return (
    (props.match && props.match.params && props.match.params.ensemble_name) ||
    props.ensemble_name ||
    process.env.REACT_APP_CE_ENSEMBLE_NAME
  );
}

export default class SingleAppController extends React.Component {
  // To manage fetching of metadata, this component follows React best practice:
  // https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change
  // This affects how initial state is defined (`ensemble_name`) and what
  // is done in lifecycle hooks. The value determining whether data should
  // be fetched is `ensemble_name(props)`. (Therefore, unlike the example in
  // the React documentation, it not a single prop value, but it is derived
  // directly from the props). The value managed is `this.state.meta`.

  state = {
    prev_ensemble_name: undefined,

    model: undefined,
    scenario: undefined,
    variable: undefined,

    area: undefined,  // geojson object
    meta: null,
  };

  static getDerivedStateFromProps(props, state) {
    // Store prev_ensemble_name in state so we can compare when props change.
    // Clear out previously-loaded data (so we don't render stale stuff).
    const new_ensemble_name = ensemble_name(props);
    if (new_ensemble_name !== state.prev_ensemble_name) {
      return {
        meta: null,
        prev_ensemble_name: new_ensemble_name,
      };
    }

    // No state update necessary
    return null;
  }

  componentDidMount() {
    this.fetchMetadata(ensemble_name(this.props));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.meta === null) {
      this.fetchMetadata(ensemble_name(this.props));
    }
  }

  fetchMetadata(ensemble_name) {
    getMetadata(ensemble_name)
      // Prefilter metadata to show only items we want in this portal.
      .then(filter(
        m => !(m.multi_year_mean === false && m.timescale === 'monthly')
      ))
      .then(meta => this.setState({ meta }));
  }

  /*
   * Called when user sets an area on the MapController. Propagates the area
   * chosen to a DataController.
   */
  handleSetArea = (geojson) => {
    this.setState({ area: geojson });
  };

  handleChangeModel = (model) => {
    this.setState({ model });
  };

  replaceInvalidModel = (options, value) => {
    return find({ value: { representative: { model_id: 'PCIC12' }}})(options);
  };

  handleChangeScenario = (scenario) => {
    this.setState({ scenario });
  };

  replaceInvalidScenario = (options, value) => {
    return find(
      opt => opt.value.representative.experiment.includes('rcp85')
    )(options);
  };

  handleChangeVariable = (variable) => {
    this.setState({ variable });
  };

  replaceInvalidVariable = (options, value) => {
    const flatOptions = flatMap('options', options);
    const option = find(opt => !opt.isDisabled)(flatOptions);
    return option;
  };

  // TODO: Factor this out (used in other components)
  representativeValue = (optionName, valueName) => {
    // Extract a value from the representative for a named option.
    return get([optionName, 'value', 'representative', valueName])(this.state);
  };

  constraintsFor = (...optionNames) => {
    // Returns an object containing the union of all representatives of the
    // options named in the arguments (e.g., 'model', 'scenario').
    // Returned object is suitable as a constraint for a
    // `SimpleConstraintGroupingSelector`.
    return flow(
      flatten,
      map(name => this.state[name]),
      map(option => option && option.value.representative),
      reduce((result, value) => assign(result, value), {})
    )(optionNames)
  };

  filterMetaBy = (...optionNames) => {
    // Return a filtered subset of `this.meta`, based on the selected
    // model, emissions scenario, and variable.
    //
    // Initially, selectors are undefined, and go through a cascading defaulting
    // process that eventually settles with a defined value for all of them.
    // Returning a metadata set that is filtered by a partially settled
    // selector set causes problems in client components. This function
    // returns the empty array unless a full set of constraints (derived from
    // selectors) is available.
    const settled = _.allDefined(this.state, ...optionNames);
    if (!settled) {
      return [];
    }
    return flow(
      filter(this.constraintsFor(...optionNames)),
      sortBy('unique_id')
    )(this.state.meta);
  };

  render() {
    if (this.state.meta === null) {
      return <Loader/>;
    }
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
                    <ControlLabel>{modelSelectorLabel}</ControlLabel>
                    <ModelSelector
                      bases={this.state.meta}
                      value={this.state.model}
                      onChange={this.handleChangeModel}
                      replaceInvalidValue={this.replaceInvalidModel}
                    />
                  </Col>
                  <Col lg={2} md={2}>
                    <ControlLabel>{emissionScenarioSelectorLabel}</ControlLabel>
                    <EmissionsScenarioSelector
                      bases={this.state.meta}
                      constraint={this.constraintsFor('model')}
                      value={this.state.scenario}
                      onChange={this.handleChangeScenario}
                      replaceInvalidValue={this.replaceInvalidScenario}
                    />
                  </Col>
                  <Col lg={4} md={4}>
                    <ControlLabel>{variableSelectorLabel}</ControlLabel>
                    <VariableSelector
                      bases={this.state.meta}
                      constraint={this.constraintsFor('model', 'scenario')}
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
              ensemble_name={ensemble_name(this.props)}
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
  }
}
