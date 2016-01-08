import React, { PropTypes, Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import ReactTabs, { Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import { dataApiToC3, parseTimeSeriesForC3 } from '../../core/util'
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
      climoSeriesData: undefined,
      timeSeriesData: undefined,
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
      url: urljoin(CE_BACKEND_URL, 'multistats'),
      crossDomain: true,
      data: {
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: 0
      }
    });

    var my_timeseries_promise = $.ajax({
      url: urljoin(CE_BACKEND_URL, 'timeseries'),
      crossDomain: true,
      data: {
        id_ : props.unique_id || null,
        variable: props.variable_id,
        area: props.area || null
      }
    }).done(function(data) {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(data)
      });
    }.bind(this));

    $.when(my_data_promise, my_stats_promise).done(function(data_response, stats_response) {
      this.setState({
        climoSeriesData: dataApiToC3(data_response[0]),
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
    // This guards against re-rendering before Ajax calls alter the state
    return JSON.stringify(nextState) !== JSON.stringify(this.state)
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.verifyParams(nextProps)){
      this.getData(nextProps);
    }
  },

  render: function() {
    var climoSeriesData = this.state.climoSeriesData ? this.state.climoSeriesData : {data:{columns:[]}, axis:{}};
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : {data:{columns:[]}, axis:{}};
    var statsData = this.state.statsData ? this.state.statsData : {};

    return(
      <div>
        <Tabs>
          <TabList>
            <Tab>Climo Series</Tab>
            <Tab>Seasonal Range</Tab>
          </TabList>
          <TabPanel>
            <DataGraph data={timeSeriesData.data} axis={timeSeriesData.axis} tooltip={timeSeriesData.tooltip} />
          </TabPanel>
          <TabPanel>
            <DataGraph data={climoSeriesData.data} axis={climoSeriesData.axis} />
          </TabPanel>
        </Tabs>
        <DataTable data={statsData} />
      </div>
  )}
})

export default DataController
