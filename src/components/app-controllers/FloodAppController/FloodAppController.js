/***************************************************************
 * FloodAppController.js
 *
 * This controller displays streamflow return period data, which
 * is a very simple data collection - annual only, and only one
 * "model" (actually an ensemble of models).
 * Each variable has a set of "mean" data representing the ensemble
 * mean, and some "percentile" data representing percentiles of the
 * ensemble of models. The "percentile" datasets are queried separately
 * from the backend and their metadata is kept in the percentileMeta
 * prop and passed to the DataController as filteredPercentileMeta.
 * Percentile data is not passed to the MapController, it is not
 * anticipated that users will want to see maps of percentile
 * datasets.
 * Children:
 *  - SingleMapController
 *  - FloodDataController
 ***************************************************************/

import PropTypes from "prop-types";
import React from "react";
import { Col, ControlLabel, Grid, Panel, Row } from "react-bootstrap";
import _ from "lodash";

import SingleMapController from "../../map-controllers/SingleMapController";
import FloodDataController from "../../data-controllers/FloodDataController/FloodDataController";
import {
  EmissionsScenarioSelector,
  ModelSelector,
  VariableSelector,
} from "pcic-react-components";
import {
  datasetFilterPanelLabel,
  emissionScenarioSelectorLabel,
  modelSelectorLabel,
  variableSelectorLabel,
} from "../../guidance-content/info/InformationItems";

import g from "../../../core/geo";
import { FullWidthCol, HalfWidthCol } from "../../layout/rb-derived-components";
import FilteredDatasetsSummary from "../../data-presentation/FilteredDatasetsSummary";
import FlowArrow from "../../data-presentation/FlowArrow";
import UnfilteredDatasetsSummary from "../../data-presentation/UnfilteredDatasetsSummary";

import { ensemble_name } from "../common";
import { setNamedState } from "../../../core/react-component-utils";
import withAsyncMetadata from "../../../HOCs/withAsyncMetadata";
import withAsyncPercentileMetadata from "../../../HOCs/withAsyncPercentileMetadata";
import {
  findModelNamed,
  findScenarioIncluding,
  findVariableMatching,
  representativeValue,
  constraintsFor,
  filterMetaBy,
} from "../../../core/selectors";

class FloodAppControllerDisplay extends React.Component {
  // This is a pure (state-free), controlled component that renders the
  // entire content of FloodAppController, including the controls.
  // It is wrapped by `withAsyncMetadata` and `withASynPercentileMeta`
  // to inject the asynchronously fetched metadata that it needs.

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
    percentileMeta: PropTypes.array,
  };

  replaceInvalidModel = findModelNamed("PCIC12");
  replaceInvalidScenario = findScenarioIncluding(["rcp85"]);
  replaceInvalidVariable = findVariableMatching((opt) => !opt.isDisabled);

  representativeValue = (...args) => representativeValue(...args)(this.props);
  constraintsFor = (...args) => constraintsFor(...args)(this.props);
  filterMetaBy = (...args) =>
    filterMetaBy(...args)(this.props)(this.props.meta);
  filterPercentileMetaBy = (...args) =>
    filterMetaBy(...args)(this.props)(this.props.percentileMeta);

  render() {
    const filteredMeta = this.filterMetaBy("model", "scenario", "variable");
    const filteredPercentileMeta = this.filterPercentileMetaBy(
      "model",
      "scenario",
      "variable",
    );

    const model_id = this.representativeValue("model", "model_id");
    const experiment = this.representativeValue("scenario", "experiment");
    const variable_id = this.representativeValue("variable", "variable_id");

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
                      constraint={this.constraintsFor("model")}
                      value={this.props.scenario}
                      onChange={this.props.onChangeScenario}
                      replaceInvalidValue={this.replaceInvalidScenario}
                    />
                  </Col>
                  <Col lg={4} md={4}>
                    <ControlLabel>{variableSelectorLabel}</ControlLabel>
                    <VariableSelector
                      bases={this.props.meta}
                      constraint={this.constraintsFor("model", "scenario")}
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
              meta={filteredMeta}
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
              meta={filteredMeta}
              area={this.props.area}
              onSetArea={this.props.onChangeArea}
              pointSelect={true}
              watershedEnsemble={this.props.ensemble_name}
            />
          </HalfWidthCol>
          <HalfWidthCol>
            <FloodDataController
              ensemble_name={this.props.ensemble_name}
              model_id={model_id}
              variable_id={variable_id}
              experiment={experiment}
              area={g.geojson(this.props.area).toWKT()}
              meta={filteredMeta}
              percentileMeta={filteredPercentileMeta} //to generate percentile graphs
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

// Inject asynchronously fetched metadata into controlled component.
const withAllAPIData = _.flow(withAsyncPercentileMetadata, withAsyncMetadata);

const WmdFloodAppControllerDisplay = withAllAPIData(FloodAppControllerDisplay);

export default class FloodAppController extends React.Component {
  // This manages the state of selectors and renders the display component.

  state = {
    model: undefined,
    scenario: undefined,
    variable: undefined,
    area: undefined, // geojson object
  };

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  handleChangeArea = setNamedState(this, "area");
  handleChangeModel = setNamedState(this, "model");
  handleChangeScenario = setNamedState(this, "scenario");
  handleChangeVariable = setNamedState(this, "variable");

  render() {
    return (
      <WmdFloodAppControllerDisplay
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
