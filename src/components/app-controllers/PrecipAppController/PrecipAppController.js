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

import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Panel, ControlLabel } from 'react-bootstrap';

import DualDataController from
    '../../data-controllers/DualDataController/DualDataController';
import {
  modelSelectorLabel, emissionScenarioSelectorLabel, variableSelectorLabel,
  datasetFilterPanelLabel, variable1SelectorLabel
} from '../../guidance-content/info/InformationItems';

import g from '../../../core/geo';
import PrecipMapController from '../../map-controllers/PrecipMapController';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import FilteredDatasetsSummary from
    '../../data-presentation/FilteredDatasetsSummary';

import FlowArrow from '../../data-presentation/FlowArrow';
import UnfilteredDatasetsSummary from
    '../../data-presentation/UnfilteredDatasetsSummary';
import {
  EmissionsScenarioSelector,
  ModelSelector, VariableSelector
} from 'pcic-react-components';

import {
  ensemble_name,
} from '../common';
import { setNamedState } from '../../../core/react-component-utils';
import withAsyncMetadata from '../../../HOCs/withAsyncMetadata'
import {
  findModelNamed, findScenarioIncluding, findVariableMatching,
  representativeValue, constraintsFor, filterMetaBy,
} from '../../../core/selectors';


class PrecipAppControllerDisplay extends React.Component {
  // This is a pure (state-free), controlled component that renders the
  // entire content of PrecipAppController, including the controls.
  // It is wrapped by `withAsyncMetadata` to inject the asynchronously fetched
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
    onChangeArea: PropTypes.func,
    meta: PropTypes.array,
  };

  replaceInvalidModel = findModelNamed('CanESM2');
  replaceInvalidScenario = findScenarioIncluding(['rcp85']);
  replaceInvalidVariable = findVariableMatching(this.props.comparand);

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
              area={this.props.area}
              onSetArea={this.props.onChangeArea}
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
              area={g.geojson(this.props.area).toWKT()}
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}


// Inject asynchronously fetched metadata into controlled component.
const WmdPrecipAppControllerDisplay = withAsyncMetadata(PrecipAppControllerDisplay);


// In this controller, `comparand` is a fixed value. It is easiest to
// let existing state-based methods, which expect variable selector option
// value, do the work, rather than coding a special solution for this case.
// Hence this:
const comparand = {
  value: {
    representative: {
      variable_id: 'pr',
      variable_name: 'Precipitation',
      multi_year_mean: true
    }
  }
};

export default class PrecipAppController extends React.Component {
  state = {
    model: undefined,
    scenario: undefined,
    variable: undefined,
    area: undefined,  // geojson object
  };

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  handleChangeArea = setNamedState(this, 'area');
  handleChangeModel = setNamedState(this, 'model');
  handleChangeScenario = setNamedState(this, 'scenario');
  handleChangeVariable = setNamedState(this, 'variable');

  render() {
    return (
      <WmdPrecipAppControllerDisplay
        ensemble_name={ensemble_name(this.props)}
        {...this.state}
        comparand={comparand}
        onChangeArea={this.handleChangeArea}
        onChangeModel={this.handleChangeModel}
        onChangeScenario={this.handleChangeScenario}
        onChangeVariable={this.handleChangeVariable}
      />
    );
  }
}
