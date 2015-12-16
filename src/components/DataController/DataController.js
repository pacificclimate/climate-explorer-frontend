import React, { PropTypes, Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';

import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';

var DataController = React.createClass({

  propTypes: {
    unique_id: React.PropTypes.string,
    model_id: React.PropTypes.string,
    variable_id: React.PropTypes.string,
    experiment: React.PropTypes.string,
    area: React.PropTypes.string,
    time: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      timeseriesData: undefined,
      statsData: undefined
    };
  },

  getData: function(props){

    var my_data_promise = $.ajax({
      url: urljoin(CE_BACKEND_URL, 'data'),
      crossDomain: true,
      data: {
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: 0
      }
    });
  
    var my_stats_promise = $.ajax({
      url: urljoin(CE_BACKEND_URL, 'stats'),
      crossDomain: true,
      data: {
        id_ : props.unique_id || null,
        variable: props.variable_id,
        area: props.area || null,
        time: 0
      }
    });

    $.when(my_data_promise, my_stats_promise).done(function(data_response, stats_response) {
      this.setState({
        timeseriesData: data_response[0],
        statsData: stats_response[0]
      });
    }.bind(this));
  },

  verifyParams: function(props){
    var stringPropList = _.values(_.pick(props, 'unique_id', 'model_id', 'variable_id', 'experiment'));
    return (stringPropList.length > 0) && stringPropList.every(Boolean) 
  },

  componentDidMount: function() {
    if (this.verifyParams(this.props)){
      this.getData(this.props);
    }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return JSON.stringify(nextProps) !== JSON.stringify(this.props)
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.verifyParams(nextProps)){
      this.getData(nextProps);
    }
  },

  render: function() {
    var timeseriesData = this.state.timeseriesData ? this.state.timeseriesData: {columns:[]};
    var statsData = this.state.statsData ? this.state.statsData : {};

    return(
      <div>
        <DataGraph data={timeseriesData} />
        <DataTable data={statsData} />
      </div>
  )}
})

export default DataController
