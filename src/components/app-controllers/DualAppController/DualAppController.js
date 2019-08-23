/************************************************************************
 * DualAppController.js - Two-variable application controller
 * 
 * This controller represents a portal that allows the user to compare 
 * and display two variables at once. It has dropdowns to select a model,
 * experiment, and two seperate variables. 
 * 
 * Its children are DualDataController, which coordinates graphs comparing
 * the two selected variables, and DualMapController, which coordinates a map
 * displaying one variable as scalar colours and the other as isolines.
 * 
 * The main variable is internally referred to as "variable," the variable
 * being compared to it is internally referred to as "comparand." 
 * Timestamps and available datasets are based on what's available for 
 * the main variable; if the user selects parameters for which the 
 * comparand lacks data, it won't be displayed.
 ************************************************************************/

import React from 'react';
import { Grid, Row, Col, Panel, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';

import DualDataController from '../../data-controllers/DualDataController/DualDataController';
import {
  modelSelectorLabel,
  emissionScenarioSelectorLabel,
  variable1SelectorLabel,
  variable2SelectorLabel,
  datasetFilterPanelLabel,
} from '../../guidance-content/info/InformationItems';

import g from '../../../core/geo';
import DualMapController from '../../map-controllers/DualMapController';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import FilteredDatasetsSummary from '../../data-presentation/FilteredDatasetsSummary';

import FlowArrow from '../../data-presentation/FlowArrow';
import UnfilteredDatasetsSummary from '../../data-presentation/UnfilteredDatasetsSummary';
import {
  EmissionsScenarioSelector,
  ModelSelector, VariableSelector
} from 'pcic-react-components';
import { getMetadata } from '../../../data-services/ce-backend';
import {
  ensemble_name, filterOutMonthlyMym,
  findModelNamed, findScenarioIncluding, findVariableMatching,
  representativeValue, constraintsFor, filterMetaBy,
  setState
} from '../common';


export default class DualAppController extends React.Component {
  // To manage fetching of metadata, this component follows React best practice:
  // https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change
  // This affects how initial state is defined (`ensemble_name`) and what
  // is done in lifecycle hooks. The value determining whether data should
  // be fetched is `ensemble_name(props)`. (Therefore, unlike the example in
  // the React documentation, it not a single prop value, but it is derived
  // directly from the props). The value managed is `this.state.meta`.
  // TODO: Async data fetching is common to all app controllers and can
  //  almost certainly be factored out as a HOC to be applied to simpler,
  //  more app-specific components.

  state = {
    prev_ensemble_name: undefined,

    model: undefined,
    scenario: undefined,
    variable: undefined,
    comparand: undefined,

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
      .then(filterOutMonthlyMym)
      .then(meta => this.setState({ meta }));
  }

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  handleSetArea = setState(this, 'area');
  handleChangeModel = setState(this, 'model');
  handleChangeScenario = setState(this, 'scenario');
  handleChangeVariable = setState(this, 'variable');
  handleChangeComparand = setState(this, 'comparand');

  replaceInvalidModel = findModelNamed('CanESM2');
  replaceInvalidScenario = findScenarioIncluding('rcp85');
  replaceInvalidVariable = findVariableMatching(opt => !opt.isDisabled);

  representativeValue = (...args) => representativeValue(...args)(this.state);
  constraintsFor = (...args) => constraintsFor(...args)(this.state);
  filterMetaBy = (...args) => filterMetaBy(...args)(this.state)(this.state.meta);

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
                  <Col lg={3} md={3}>
                    <ControlLabel>{variable1SelectorLabel}</ControlLabel>
                    <VariableSelector
                      bases={this.state.meta}
                      constraint={this.constraintsFor('model', 'scenario')}
                      value={this.state.variable}
                      onChange={this.handleChangeVariable}
                      replaceInvalidValue={this.replaceInvalidVariable}
                    />
                  </Col>
                  <Col lg={3} md={3}>
                    <ControlLabel>{variable2SelectorLabel}</ControlLabel>
                    <VariableSelector
                      bases={this.state.meta}
                      constraint={this.constraintsFor('model', 'scenario')}
                      value={this.state.comparand}
                      onChange={this.handleChangeComparand}
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
            <DualMapController
              model_id={model_id}
              experiment={experiment}
              variable_id={variable_id}
              meta={filteredMetaVariable}
              comparand_id={comparand_id}
              comparandMeta={filteredMetaComparand}
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
              comparandMeta={
                // TODO: Is this conditional necessary?
                this.state.comparand ?
                  filteredMetaComparand :
                  filteredMetaVariable
              }
              area={g.geojson(this.state.area).toWKT()}
            />
          </HalfWidthCol>
        </Row>
      </Grid>

    );
  }
}