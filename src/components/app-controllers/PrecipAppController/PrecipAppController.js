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
import { Grid, Row, Col, Panel, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';

import DualDataController from
    '../../data-controllers/DualDataController/DualDataController';
import {
  modelSelectorLabel, emissionScenarioSelectorLabel, variableSelectorLabel,
  datasetFilterPanelLabel, variable1SelectorLabel
} from '../../guidance-content/info/InformationItems';

import g from '../../../core/geo';
import PrecipMapController from '../../map-controllers/PrecipMapController';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import FilteredDatasetsSummary from '../../data-presentation/FilteredDatasetsSummary';


import _ from 'lodash';
import FlowArrow from '../../data-presentation/FlowArrow';
import UnfilteredDatasetsSummary from '../../data-presentation/UnfilteredDatasetsSummary';
import { getMetadata } from '../../../data-services/ce-backend';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import flatMap from 'lodash/fp/flatMap';
import get from 'lodash/fp/get';
import flow from 'lodash/fp/flow';
import flatten from 'lodash/fp/flatten';
import map from 'lodash/fp/map';
import reduce from 'lodash/fp/reduce';
import assign from 'lodash/fp/assign';
import sortBy from 'lodash/fp/sortBy';
import {
  EmissionsScenarioSelector,
  ModelSelector, VariableSelector
} from 'pcic-react-components';

// TODO: Extract to utility module.
function ensemble_name(props) {
  return (
    (props.match && props.match.params && props.match.params.ensemble_name) ||
    props.ensemble_name ||
    process.env.REACT_APP_CE_ENSEMBLE_NAME
  );
}

export default class PrecipAppController extends React.Component {

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
    // This is an unmitigated hack, but it is simple and leads to simple
    // code. In this controller, `comparand` is a fixed value. Even
    // though we never change it, it is easiest to store it here and let
    // existing tools use the data in it, rather than coding a special solution
    // for this case.
    // TODO: Actually, when common code is factored out, this can probably
    // be moved to a separate, true constant. Here for now.
    comparand: {
      value: {
        representative: {
          variable_id: 'pr',
          variable_name: 'Precipitation',
          multi_year_mean: true
        }
      }
    },

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
    // TODO: Extract this to a common component
      .then(filter(
        m => !(m.multi_year_mean === false && m.timescale === 'monthly')
      ))
      .then(meta => this.setState({ meta }))
    ;
  }

  handleSetArea = (geojson) => {
    this.setState({ area: geojson });
  };

  handleChangeModel = (model) => {
    this.setState({ model });
  };

  // TODO: Extract (common)
  // Default to first option if cannot be found
  replaceInvalidModel = (options, value) => {
    return find({ value: { representative: { model_id: 'CanESM2' }}})(options);
  };

  handleChangeScenario = (scenario) => {
    this.setState({ scenario });
  };

  // TODO: Extract (common)
  replaceInvalidScenario = (options, value) => {
    return find(
      opt => opt.value.representative.experiment.includes('rcp85')
    )(options);
  };

  handleChangeVariable = (variable) => {
    this.setState({ variable });
  };

  // TODO: Extract (common)
  replaceInvalidVariable = (options, value) => {
    const flatOptions = flatMap('options', options);
    const option = find(this.state.comparand)(flatOptions);
    return option;
  };

  // TODO: Factor this out (used in other components)
  representativeValue = (optionName, valueName) => {
    // Extract a value from the representative for a named option.
    return get([optionName, 'value', 'representative', valueName])(this.state);
  };

  // TODO: Extract (common)
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

  // TODO: Extract (common)
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

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  render() {
    if (this.state.meta === null) {
      return <Loader/>;
    }

    const filteredMetaVariable = this.filterMetaBy('model', 'scenario', 'variable');
    const filteredMetaComparand = this.filterMetaBy('model', 'scenario', 'comparand');

    const model_id = this.representativeValue('model', 'model_id');
    const experiment = this.representativeValue('scenario', 'experiment');
    const variable_id = this.representativeValue('variable', 'variable_id');
    const comparand_id = this.representativeValue('comparand', 'variable_id');

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
              comparand_id={comparand_id}
              meta={filteredMetaVariable}
              comparandMeta={filteredMetaComparand}
              dual
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
            <PrecipMapController
              model_id={model_id}
              experiment={experiment}
              variable_id={variable_id}
              meta={filteredMetaVariable}
              comparand_id={comparand_id}
              comparandMeta = {filteredMetaComparand}
              area={this.state.area}
              onSetArea={this.handleSetArea}
            />
          </HalfWidthCol>
          <HalfWidthCol>
            <DualDataController
              ensemble_name={ensemble_name(this.props)}
              model_id={model_id}
              experiment={experiment}
              variable_id={variable_id}
              meta={filteredMetaVariable}
              comparand_id={comparand_id}
              comparandMeta = {filteredMetaComparand}
              area={g.geojson(this.state.area).toWKT()}
            />
          </HalfWidthCol>
        </Row>
      </Grid>

    );
  }
}