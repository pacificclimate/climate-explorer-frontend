import React, { PropTypes, Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import { Input } from 'react-bootstrap';
import { Grid, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import MapController from '../MapController/MapController';
import GraphOverlay from '../DataGraph/GraphOverlay';
import TableOverlay from '../DataTable/TableOverlay';

import styles from './AppController.css';


var Selector = React.createClass({
  getDefaultProps: function() {
    return {
      label: "Selection",
      items: []
    };
  },

  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },

  render: function() {
    return (
      <Input type="select" label={this.props.label} onChange={this.handleChange}>
      { this.props.items.map(function(item){
        return <option key={item}>{item} </option>
      })}
      </Input>
      );
  }
});



var App = React.createClass({

  getInitialState: function() {
    return {
      meta: [],
      filter: {}
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
  
  render: function() {
    var getModels = function() {
      return _.unique(this.state.meta.map(function(el){return el['model_id']}))
    }.bind(this);

    var getVariables = function() {
      return _.unique(this.state.meta.map(function(el){return el['variable_id']}))
    }.bind(this)

    var getScenarios = function() {
      return _.unique(this.state.meta.map(function(el){return el['experiment']}))
    }.bind(this)

    return (
      <Grid fluid={true}>
        <Row>
          <Col lg={4}>
            <Selector label={"Model Selection"} onChange={this.updateSelection.bind(this, 'model_id')} items={getModels()}/>
          </Col>
          <Col lg={4}>
            <Selector label={"Variable Selection"} onChange={this.updateSelection.bind(this, 'variable_id')} items={getVariables()}/>
          </Col>
          <Col lg={4}>
            <Selector label={"Emission Scenario Selection"} onChange={this.updateSelection.bind(this, 'experiment')} items={getScenarios()}/>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div className={styles.map}>
              <MapController {...this.state} />
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