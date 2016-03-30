import React from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import { Grid, Row, Col } from 'react-bootstrap';

import MapController from '../MapController';
import MotiDataController from '../MotiDataController';
import Selector from '../Selector';

var App = React.createClass({

  /**
   * Initial state set upon metadata returning in {@link App#componentDidMount}.
   * Includes:
   *   - model_id
   *   - variable_id
   *   - experiment
   */
  getInitialState: function () {
    return {
      meta: [],
    };
  },

  componentDidMount: function () {
    var models = [];
    var vars;
    $.ajax({
      url: urljoin(CE_BACKEND_URL, 'multimeta'),
      data: { ensemble_name: CE_ENSEMBLE_NAME },
      crossDomain: true,
    }).done(function (data) {
      for (var key in data) {
        vars = Object.keys(data[key].variables);

        for (var v in vars) {
          models.push(_.extend({
            unique_id: key,
            variable_id: vars[v],
            variable_name: data[key].variables[vars[v]],
          }, _.omit(data[key], 'variables')));
        }
      }

      this.setState({
        meta: models,
        model_id: models[0].model_id,
        variable_id: models[0].variable_id,
        experiment: models[0].experiment,
      });
    }.bind(this));
  },

  getfilteredMeta: function () {
    var l = this.state.meta.filter(function (x) {
      return x.model_id === this.state.model_id && x.experiment === this.state.experiment && x.variable_id === this.state.variable_id;
    }, this);
    l.sort(function (a, b) {return a.unique_id > b.unique_id ? 1 : -1;});
    return l;
  },

  handleSetArea: function (wkt) {
    this.setState({ area: wkt });
  },

  updateSelection: function (param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  render: function () {
    var getThings = function (thing) {
      return _.unique(this.state.meta.map(function (el) {return el[thing];}));
    }.bind(this);

    // Source, format and sort variable names
    var varArray = _.zip(getThings('variable_id'), getThings('variable_name'));
    var varNames = _.map(varArray, function (v) {
      return v[0] + ' - ' + v[1];
    });
    var varOptions = _.zip(getThings('variable_id'), varNames).sort(function (a, b) {
      return a[0] > b[0] ? 1 : -1;
    });

    return (
      <Grid fluid>
        <Row>
          <Col lg={4} md={4}>
            <Selector label={"Variable Selection"} onChange={this.updateSelection.bind(this, 'variable_id')} items={varOptions}/>
          </Col>
          <Col lg={4} md={4}>
            <Selector label={"Emission Scenario Selection"} onChange={this.updateSelection.bind(this, 'experiment')} items={getThings('experiment')}/>
          </Col>
          <Col lg={4} md={4} />
        </Row>
        <Row>
          <Col lg={6}>
            <div>
              <MapController
                meta = {this.getfilteredMeta()}
                onSetArea={this.handleSetArea}
              />
            </div>
          </Col>
          <Col lg={6}>
            <MotiDataController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              experiment={this.state.experiment}
              area={this.state.area}
              meta = {this.getfilteredMeta()}
            />
          </Col>
        </Row>
      </Grid>

    );
  },
});

export default App;
