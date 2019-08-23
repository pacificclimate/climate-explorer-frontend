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

import {
  ensemble_name, filterOutMonthlyMym,
  findModelNamed, findScenarioIncluding, findVariableMatching,
  representativeValue, constraintsFor, filterMetaBy,
  setState,
} from '../common';


export default class SingleAppController extends React.Component {
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
      .then(filterOutMonthlyMym)
      .then(meta => this.setState({ meta }));
  }

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  handleSetArea = setState(this, 'area');
  handleChangeModel = setState(this, 'model');
  handleChangeScenario = setState(this, 'scenario');
  handleChangeVariable = setState(this, 'variable');

  replaceInvalidModel = findModelNamed('PCIC12');
  replaceInvalidScenario = findScenarioIncluding('rcp85');
  replaceInvalidVariable = findVariableMatching(opt => !opt.isDisabled);

  representativeValue = (...args) => representativeValue(...args)(this.state);
  constraintsFor = (...args) => constraintsFor(...args)(this.state);
  filterMetaBy = (...args) => filterMetaBy(...args)(this.state)(this.state.meta);

  render() {
    if (this.state.meta === null) {
      return <Loader/>;
    }
    const filteredMeta = this.filterMetaBy('model', 'scenario', 'variable');
    const modelContextMetadata = this.filterMetaBy('scenario', 'variable');

    const model_id = this.representativeValue('model', 'model_id');
    const experiment = this.representativeValue('scenario', 'experiment');
    const variable_id = this.representativeValue('variable', 'variable_id');

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
