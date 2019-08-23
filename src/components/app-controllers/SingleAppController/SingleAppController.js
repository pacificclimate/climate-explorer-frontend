/***************************************************************
 * SingleAppController.js 
 * 
 * This controller represents climate explorer's main portal. It
 * has dropdowns to allow a user to select a model, emission
 * scenario, and variable. It loads and filters metadata for 
 * the selected datasets and passes them to its children:  
 * - SingleMapController (displays a variable as a colour-shaded map) 
 * - SingleDataController (displays graphs and a statistical table).
 ***************************************************************/

import PropTypes from 'prop-types';
import React from 'react';
import { Col, ControlLabel, Grid, Panel, Row } from 'react-bootstrap';

import SingleMapController from '../../map-controllers/SingleMapController';
import SingleDataController
  from '../../data-controllers/SingleDataController/SingleDataController';
import {
  EmissionsScenarioSelector,
  ModelSelector,
  VariableSelector,
} from 'pcic-react-components';
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

import {
  ensemble_name, filterOutMonthlyMym,
  findModelNamed, findScenarioIncluding, findVariableMatching,
  representativeValue, constraintsFor, filterMetaBy,
  setState, withMetadata,
} from '../common';


class SingleAppControllerDisplay extends React.Component {
  // This is a pure (state-free), controlled component that renders the
  // entire content of SingleAppController, including the controls.
  // It is wrapped by `withMetadata` to inject the asynchronously fetched
  // metadata that it needs.

  static propTypes = {
    ensemble_name: PropTypes.string,
    model: PropTypes.object,
    scenario: PropTypes.object,
    variable: PropTypes.object,
    area: PropTypes.object,
    onChangeModel: PropTypes.func,
    onChangeScenario: PropTypes.func,
    onChangeVariable: PropTypes.func,
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
    console.log('### SingleAppControllerDisplay')
    const filteredMeta = this.filterMetaBy('model', 'scenario', 'variable');
    const modelContextMetadata = this.filterMetaBy('scenario', 'variable');

    const model_id = this.representativeValue('model', 'model_id');
    const experiment = this.representativeValue('scenario', 'experiment');
    const variable_id = this.representativeValue('variable', 'variable_id');

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
                  <Col lg={4} md={4}>
                    <ControlLabel>{variableSelectorLabel}</ControlLabel>
                    <VariableSelector
                      bases={this.props.meta}
                      constraint={this.constraintsFor('model', 'scenario')}
                      value={this.props.variable}
                      onChange={this.props.onChangeVariable}
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
              area={this.props.area}
              onSetArea={this.handleSetArea}
            />
          </HalfWidthCol>
          <HalfWidthCol>
            <SingleDataController
              ensemble_name={this.props.ensemble_name}
              model_id={model_id}
              variable_id={variable_id}
              experiment={experiment}
              area={g.geojson(this.props.area).toWKT()}
              meta = {filteredMeta}
              contextMeta={modelContextMetadata} //to generate Model Context graph
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}


// Inject asynchronously fetched metadata into controlled component.
const WmdSingleAppControllerDisplay = withMetadata(SingleAppControllerDisplay);


export default class SingleAppController extends React.Component {
  // This manages the state of selectors and renders the display component.

  state = {
    model: undefined,
    scenario: undefined,
    variable: undefined,
    area: undefined,  // geojson object
  };

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  handleChangeArea = setState(this, 'area');
  handleChangeModel = setState(this, 'model');
  handleChangeScenario = setState(this, 'scenario');
  handleChangeVariable = setState(this, 'variable');

  render() {
    console.log('### SingleAppController')
    return (
      <WmdSingleAppControllerDisplay
        ensemble_name={ensemble_name(this.props)}
        {...this.state}
        onChangeArea={this.handleChangeArea}
        onChangeModel={this.handleChangeModel}
        onChangeScenario={this.handleChangeScenario}
        onChangeVariable={this.handleChangeVariable}
      />
    );
  }
}
