import React, { PropTypes, Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import { Input } from 'react-bootstrap';
import { Grid, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import MapController from '../MapController/MapController';
import GraphOverlay from '../DataGraph/GraphOverlay';
import TableOverlay from '../DataTable/TableOverlay';
import Selector from '../Selector/Selector';

import styles from './AppController.css';

var App = React.createClass({

  getInitialState: function() {
    return {
      meta: [],
      filter: {},
      model_id: 'BCCAQ+ANUSPLINE300+MPI-ESM-LR',
      variable_id: 'tasmax',
      experiment: 'historical+rcp85'
    };
  },

  componentDidMount: function() {
    $.ajax({
      url: urljoin(CE_BACKEND_URL, 'multimeta'),
      ensemble_name: 'ce',
      crossDomain: true
    }).done(function(data) {
      var models = [];
      for (var key in data) {
        var vars = Object.keys(data[key]['variables'])

        for (var v in vars) {
          models.push(_.extend(
            {
              'unique_id': key,
              'variable_id': vars[v],
              'variable_name': data[key]['variables'][vars[v]]
            }, _.omit(data[key], 'variables')
          ))
        }
      }

      if (this.isMounted()) {
        this.setState({
          meta: models
        })
      }
    }.bind(this));
  },

  updateSelection: function(param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  findUniqueId: function() {
      var l = this.state.meta.filter(
	  function(x) {
	      return x['model_id'] === this.state.model_id && x['experiment'] === this.state.experiment && x['variable_id'] === this.state.variable_id
	  }, this
      );
      if (l.length > 0) {
	  return l[0].unique_id;
      }
  },

  render: function() {
    var getThings = function(thing) {
      return _.unique(this.state.meta.map(function(el){return el[thing]}))
    }.bind(this);
    return (
      <Grid fluid={true}>
        <Row>
          <Col lg={4}>
            <Selector label={"Model Selection"} onChange={this.updateSelection.bind(this, 'model_id')} items={getThings('model_id')}/>
          </Col>
          <Col lg={4}>
            <Selector label={"Variable Selection"} onChange={this.updateSelection.bind(this, 'variable_id')} items={getThings('variable_id')}/>
          </Col>
          <Col lg={4}>
            <Selector label={"Emission Scenario Selection"} onChange={this.updateSelection.bind(this, 'experiment')} items={getThings('experiment')}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div className={styles.map}>
              <MapController variable={this.state.variable_id} dataset={this.findUniqueId()} />
            </div>
          </Col>
          <Col lg={6}>
            <GraphOverlay />
            <TableOverlay />
          </Col>
        </Row>
      </Grid>

    );
  }
})

export default App
