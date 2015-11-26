import React, { PropTypes, Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import { Input } from 'react-bootstrap';
import classNames from 'classnames';

import { CanadaMap } from '../Map/CanadaMap';


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

  setModel: function(model) {
    this.setState({
      model:model
    });
  },
  
  render: function() {
    var getModels = function() {
      return _.unique(this.state.meta.map(function(el){return el['model_id']}))
    }.bind(this);
    return (
      <div>
        <Selector label={"Model Selection"} onChange={this.setModel} items={getModels()}/>
      </div>
    );
  }
})

export default App