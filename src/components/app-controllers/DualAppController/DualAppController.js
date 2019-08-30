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

import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Panel, ControlLabel } from 'react-bootstrap';

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
  setState, withMetadata
} from '../common';


class DualAppControllerDisplay extends React.Component {
  // This is a pure (state-free), controlled component that renders the
  // entire content of DualAppController, including the controls.
  // It is wrapped by `withMetadata` to inject the asynchronously fetched
  // metadata that it needs.

  static propTypes = {
    ensemble_name: PropTypes.string,
    model: PropTypes.object,
    scenario: PropTypes.object,
    variable: PropTypes.object,
    comparand: PropTypes.object,
    area: PropTypes.object,
    onChangeModel: PropTypes.func,
    onChangeScenario: PropTypes.func,
    onChangeVariable: PropTypes.func,
    onChangeComparand: PropTypes.func,
    onChangeArea: PropTypes.func,
    meta: PropTypes.array,
  };

  replaceInvalidModel = findModelNamed('PCIC12');
  replaceInvalidScenario = findScenarioIncluding('rcp85');
  replaceInvalidVariable = findVariableMatching(opt => !opt.isDisabled);

  representativeValue = (...args) => representativeValue(...args)(this.props);
  constraintsFor = (...args) => constraintsFor(...args)(this.props);
  filterMetaBy = (...args) =>
    filterMetaBy(...args)(this.props)(this.props.meta);

  render() {
    const filteredMetaVariable =
      this.filterMetaBy('model', 'scenario', 'variable');
    const filteredMetaComparand =
      this.filterMetaBy('model', 'scenario', 'comparand');

    const model_id = this.representativeValue('model', 'model_id');
    const experiment = this.representativeValue('scenario', 'experiment');
    const variable_id = this.representativeValue('variable', 'variable_id');
    const comparand_id = this.representativeValue('comparand', 'variable_id');

    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <UnfilteredDatasetsSummary meta={this.props.meta} />
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
                      bases={this.props.meta}
                      value={this.props.model}
                      onChange={this.props.onChangeModel}
                      replaceInvalidValue={this.replaceInvalidModel}
                    />
                  </Col>
                  <Col lg={2} md={2}>
                    <ControlLabel>{emissionScenarioSelectorLabel}</ControlLabel>
                    <EmissionsScenarioSelector
                      bases={this.props.meta}
                      constraint={this.constraintsFor('model')}
                      value={this.props.scenario}
                      onChange={this.props.onChangeScenario}
                      replaceInvalidValue={this.replaceInvalidScenario}
                    />
                  </Col>
                  <Col lg={3} md={3}>
                    <ControlLabel>{variable1SelectorLabel}</ControlLabel>
                    <VariableSelector
                      bases={this.props.meta}
                      constraint={this.constraintsFor('model', 'scenario')}
                      value={this.props.variable}
                      onChange={this.props.onChangeVariable}
                      replaceInvalidValue={this.replaceInvalidVariable}
                    />
                  </Col>
                  <Col lg={3} md={3}>
                    <ControlLabel>{variable2SelectorLabel}</ControlLabel>
                    <VariableSelector
                      bases={this.props.meta}
                      constraint={this.constraintsFor('model', 'scenario')}
                      value={this.props.comparand}
                      onChange={this.props.onChangeComparand}
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
              area={this.props.area}
              onSetArea={this.handleSetArea}
            />
          </HalfWidthCol>
          <HalfWidthCol>
            <DualDataController
              ensemble_name={this.props.ensemble_name}
              model_id={model_id}
              experiment={experiment}
              variable_id={variable_id}
              meta={filteredMetaVariable}
              comparand_id={comparand_id}
              comparandMeta={
                // TODO: Is this conditional necessary?
                this.props.comparand ?
                  filteredMetaComparand :
                  filteredMetaVariable
              }
              area={g.geojson(this.props.area).toWKT()}
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}


// Inject asynchronously fetched metadata into controlled component.
const WmdDualAppControllerDisplay = withMetadata(DualAppControllerDisplay);


export default class DualAppController extends React.Component {
  // This manages the state of selectors and renders the display component.

  state = {
    model: undefined,
    scenario: undefined,
    variable: undefined,
    comparand: undefined,
    area: undefined,  // geojson object
  };

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  handleChangeArea = setState(this, 'area');
  handleChangeModel = setState(this, 'model');
  handleChangeScenario = setState(this, 'scenario');
  handleChangeVariable = setState(this, 'variable');
  handleChangeComparand = setState(this, 'comparand');

  render() {
    return (
      <WmdDualAppControllerDisplay
        ensemble_name={ensemble_name(this.props)}
        {...this.state}
        onChangeArea={this.handleChangeArea}
        onChangeModel={this.handleChangeModel}
        onChangeScenario={this.handleChangeScenario}
        onChangeVariable={this.handleChangeVariable}
        onChangeComparand={this.handleChangeComparand}
      />
    );
  }
}