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

  getData: function(){
    var my_data_promise = $.ajax({
      url: urljoin(CE_BACKEND_URL, 'data'),
      crossDomain: true,
      data: {
        model: this.props.model_id,
        variable: this.props.variable_id,
        emission: this.props.experiment,
        area: this.props.area,
        time: 17
      }
    });//.bind(this));
  
    var my_stats_promise = $.ajax({
      url: urljoin(CE_BACKEND_URL, 'stats'),
      crossDomain: true,
      data: {
        id_: this.props.model_id,
        variable: this.props.variable_id,
        area: this.props.area,
        time: 17
      }
    });//).bind(this);

    $.when(my_data_promise, my_stats_promise).done(function(data_response, stats_response) {
      console.log(data_response);
      console.log(stats_response);      
      console.log("done!");
    })
  },

  verifyParams: function(){
    var stringPropList = _.values(_.pick(this.props, 'unique_id', 'model_id', 'variable_id', 'experiment'));
    return (stringPropList.length > 0) && stringPropList.every(Boolean) 
  },

  componentDidMount: function() {
    if (this.verifyParams()){
      this.getData();
    }
  },

  componentDidUpdate: function() {
    if (this.verifyParams()){
      this.getData();
    }
  },

  render: function() {
    return(
      <div>
        { if (_.isEmpty(data)) {<DataGraph data={}/>} }
        <DataTable />
      </div>
  )}
})

export default DataController
