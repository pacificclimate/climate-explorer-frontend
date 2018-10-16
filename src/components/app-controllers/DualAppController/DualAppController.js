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
import createReactClass from 'create-react-class';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

import DualDataController from '../../data-controllers/DualDataController/DualDataController';
import Selector from '../../Selector';
import {
  modelSelectorLabel, emissionScenarioSelectorLabel,
  variable1SelectorLabel, variable2SelectorLabel, datasetFilterPanelLabel,
} from '../../guidance-content/info/InformationItems';

import AppMixin from '../../AppMixin';
import g from '../../../core/geo';
import DualMapController from '../../map-controllers/DualMapController';
import VariableDescriptionSelector from '../../VariableDescriptionSelector';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import FilteredDatasetsSummary from '../../data-presentation/FilteredDatasetsSummary';

import _ from 'underscore';
import FlowArrow from '../../data-presentation/FlowArrow';
import UnfilteredDatasetsSummary from '../../data-presentation/UnfilteredDatasetsSummary';

export default createReactClass({
  displayName: 'DualAppController',

  /*
   * Initial state is set after the multimeta API query run in AppMixin.componentDidMount()
   * State provided by componentDidMount():
   *  - model_id
   *  - variable_id
   *  - experiment
   *  - meta
   */

  mixins: [AppMixin],

  //This function filters out datasets inappropriate for this portal. A dataset
  //the filter returns "false" on will be removed.
  //Filters out multi-year monthly datasets; too noisy to be useful.
  datasetFilter: function (datafile) {
    return !(datafile.multi_year_mean == false && datafile.timescale == "monthly");
  },

  //because componentDidMount() is shared by all three App Controllers via a 
  //mixin, it doesn't set the initial state of DualController's unique comparison
  //variable (comparand_id), which is handled seperately here.
  componentDidUpdate: function (prevProps, prevState) {
    if(!this.state.comparand_id) {//comparand uninitialized
      this.setState({
        comparand_id: this.state.variable_id,
        comparand_name: this.state.variable_name
      });
    }
    else if(!_.contains(_.pluck(this.state.meta, "variable_id"), this.state.comparand_id)) {
      //comparand leftover from previous ensemble; not present in current one
      this.setState({
        comparand_id: this.state.variable_id,
        comparand_name: this.state.variable_name
      });
    }
  },

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/122
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  render: function () {
    //hierarchical data selection: model, then experiments (filtered by model),
    // then variable (filtered by model and experiments),
    // then comparison variable (filtered by model and experiment, must be MYM if var is.)
    var modOptions = this.getMetadataItems('model_id');
    var expOptions = this.markDisabledMetadataItems(this.getMetadataItems('experiment'),
        this.getFilteredMetadataItems('experiment', {model_id: this.state.model_id}));
    var selectedVariable = _.findWhere(this.state.meta, { model_id: this.state.model_id,
                                                          variable_id: this.state.variable_id,
                                                          experiment: this.state.experiment });
    let comparandConstraints = _.pick(this.state, 'model_id', 'experiment');
    comparandConstraints.multi_year_mean = selectedVariable ? selectedVariable.multi_year_mean : true;

    const filteredMeta = this.getFilteredMeta();
    const filteredComparandMeta = this.getFilteredMeta(this.state.comparand_id, this.state.comparand_name);

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
                    <Selector
                      label={modelSelectorLabel}
                      onChange={this.updateSelection.bind(this, 'model_id')}
                      items={modOptions}
                      value={this.state.model_id}
                    />
                  </Col>
                  <Col lg={2} md={2}>
                    <Selector
                      label={emissionScenarioSelectorLabel}
                      onChange={this.updateSelection.bind(this, 'experiment')}
                      items={expOptions}
                      value={this.state.experiment}
                    />
                  </Col>
                  <Col lg={3} md={3}>
                    <VariableDescriptionSelector
                      label={variable1SelectorLabel}
                      onChange={this.handleSetVariable.bind(this, "variable")}
                      meta={this.state.meta}
                      constraints={{model_id: this.state.model_id, experiment: this.state.experiment}}
                      value={_.pick(this.state, "variable_id", "variable_name")}
                    />
                  </Col>
                  <Col lg={3} md={3}>
                    <VariableDescriptionSelector
                      label={variable2SelectorLabel}
                      onChange={this.handleSetVariable.bind(this, "comparand")}
                      meta={this.state.meta}
                      constraints={comparandConstraints}
                      value={{variable_id: this.state.comparand_id, variable_name: this.state.comparand_name}}
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
              model_id={this.state.model_id}
              experiment={this.state.experiment}
              variable_id={this.state.variable_id}
              comparand_id={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}
              meta={filteredMeta}
              comparandMeta={filteredComparandMeta}
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
              variable_id={this.state.variable_id}
              model_id={this.state.model_id}
              experiment={this.state.experiment}
              meta={filteredMeta}
              comparand_id={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}
              comparandMeta={filteredComparandMeta}
              area={this.state.area}
              onSetArea={this.handleSetArea}
            />
          </HalfWidthCol>
          <HalfWidthCol>
            <DualDataController
              ensemble_name={this.state.ensemble_name}
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              comparand_id={this.state.comparand_id ? this.state.comparand_id : this.state.variable_id}
              experiment={this.state.experiment}
              area={g.geojson(this.state.area).toWKT()}
              meta={filteredMeta}
              comparandMeta={
                this.state.comparand_id ? filteredComparandMeta : filteredMeta
              }
            />
          </HalfWidthCol>
        </Row>
      </Grid>

    );
  },
});