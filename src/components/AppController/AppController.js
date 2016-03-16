import React, { PropTypes, Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import { Input } from 'react-bootstrap';
import { Grid, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import MapController from '../MapController';
import DataController from '../DataController/DataController';
import Selector from '../Selector';
import styles from './AppController.css';

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
      meta: []
    };
  },

  componentDidMount: function () {
    $.ajax({
      url: urljoin(CE_BACKEND_URL, 'multimeta'),
      ensemble_name: CE_ENSEMBLE_NAME,
      crossDomain: true
    }).done(function (data) {
      var models = [];
      for (var key in data) {
        var vars = Object.keys(data[key]['variables']);

        for (var v in vars) {
          models.push(_.extend(
            {
              'unique_id': key,
              'variable_id': vars[v],
              'variable_name': data[key]['variables'][vars[v]]
            }, _.omit(data[key], 'variables')
          ));
        }
      }

      if (this.isMounted()) {
        this.setState({
          meta: models,
          model_id: models[0].model_id,
          variable_id: models[0].variable_id,
          experiment: models[0].experiment
        });
      }
    }.bind(this));
  },

  updateSelection: function (param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  handleSetArea: function (wkt) {
    this.setState({ area: wkt });
  },

  getfilteredMeta: function () {
    var l = this.state.meta.filter( function (x) {
      return x.model_id === this.state.model_id && x.experiment === this.state.experiment && x.variable_id === this.state.variable_id;
    }, this );
    l.sort(function (a, b) {return a.unique_id > b.unique_id ? 1 : -1;});
    return l;
  },

  render: function () {

    var getThings = function (thing) {
      return _.unique(this.state.meta.map(function (el) {return el[thing];}));
    }.bind(this);

    return (
      <Grid fluid>
        <Row>
          <Col lg={4} md={4}>
            <Selector label={"Model Selection"} onChange={this.updateSelection.bind(this, 'model_id')} items={getThings('model_id')}/>
          </Col>
          <Col lg={4} md={4}>
            <Selector label={"Variable Selection"} onChange={this.updateSelection.bind(this, 'variable_id')} items={getThings('variable_id')}/>
          </Col>
          <Col lg={4} md={4}>
            <Selector label={"Emission Scenario Selection"} onChange={this.updateSelection.bind(this, 'experiment')} items={getThings('experiment')}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div className={styles.map}>
              <MapController
                meta = {this.getfilteredMeta()}
                onSetArea={this.handleSetArea} />
            </div>
          </Col>
          <Col lg={6}>
            <DataController
              model_id={this.state.model_id}
              variable_id={this.state.variable_id}
              experiment={this.state.experiment}
              area={this.state.area}
              meta = {this.getfilteredMeta()} />
          </Col>
        </Row>
      </Grid>

    );
  }
});

export default App;
