import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col } from 'react-bootstrap';
import Loader from 'react-loader';


import {
  dataApiToC3,
  parseTimeSeriesForC3,
  parseBootstrapTableData } from '../../core/util';
import DataGraph from '../DataGraph/DataGraph';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';

var DualDataController = React.createClass({

  propTypes: {
    model_id: React.PropTypes.string,
    variable_id: React.PropTypes.string,
    variable2_id: React.PropTypes.string,
    experiment: React.PropTypes.string,
    area: React.PropTypes.string,
    meta: React.PropTypes.array,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      projChangeTimeOfYear: 0,
      dataTableTimeOfYear: 0,
      timeSeriesDatasetId: '',
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
    };
  },

  getData: function (props) {

    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setClimoSeriesNoDataMessage("Loading Data");

    var myDataPromise = this.getDataPromise(props, this.state.projChangeTimeOfYear);
    var myDataPromise2 = this.getDataPromise(this.getVariableSwappedProps(props), this.state.projChangeTimeOfYear);


    var myTimeseriesPromise = this.getTimeseriesPromise(props, props.meta[0].unique_id);
    var myTimeseriesPromise2 = this.getTimeseriesPromise(this.getVariableSwappedProps(props), props.meta2[0].unique_id);

    Promise.all([myDataPromise, myDataPromise2]).then(values=> {
      this.setState({
        climoSeriesData: this.mergeC3Data(dataApiToC3(values[0].data), dataApiToC3(values[1].data))
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });



    Promise.all([myTimeseriesPromise, myTimeseriesPromise2]).then(values=> {
      this.setState({
        timeSeriesData: this.mergeC3Data(parseTimeSeriesForC3(values[0].data), parseTimeSeriesForC3(values[1].data))
      });
    }).catch(error=>{
      this.displayError(error, this.setTimeSeriesNoDataMessage);
      console.log(error);
    });

  },

  setTimeSeriesNoDataMessage: function(message) {
    this.setState({
      timeSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  setClimoSeriesNoDataMessage: function(message) {
    this.setState({
      climoSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  setStatsTableNoDataMessage: function(message) {
    this.setState({
      statsTableOptions: { noDataText: message },
      statsData: [],
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return JSON.stringify(nextState.climoSeriesData) !== JSON.stringify(this.state.climoSeriesData) ||
     JSON.stringify(nextState.statsData) !== JSON.stringify(this.state.statsData) ||
     JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
     JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta) ||
     nextState.statsTableOptions !== this.state.statsTableOptions;
  },

  updateProjChangeTimeOfYear: function (timeidx) {
    this.setClimoSeriesNoDataMessage("Loading Data");
    this.setState({
      projChangeTimeOfYear: timeidx,
    });
    this.getDataPromise(this.props, timeidx).then(response => {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });
  },

  updateAnnCycleDataset: function (dataset) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setState({
      timeSeriesDatasetId: dataset,
    });
    this.getTimeseriesPromise(this.props, dataset).then(response => {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });
  },

  //TODO: this is a pretty slumsy way to do this.
  getVariableSwappedProps: function (props) {
    var swapped = JSON.parse(JSON.stringify(props));
    var tmp = swapped.variable_id;
    swapped.variable_id = swapped.variable2_id;
    swapped.variable2_id = tmp;
    tmp = swapped.meta;
    swapped.meta = swapped.meta2;
    swapped.meta2 = tmp;
    if(!swapped['area']) {
      swapped.area = undefined;
    }
    return swapped;
  },

  //TODO: this dfunction needs some smartening,
  //and also a formatting fix to make axis y2 readable.
  //this function accepts two c3 charts and merges them into a single chart with
  //two y-axes, allowing two variables to be viewed at once.
  //currently rather sloppy.
  mergeC3Data: function (data1, data2) {
    var var1 = this.props.variable_id;
    var var2 = this.props.variable2_id;

    var merged = {};
    merged.tooltip = data1.tooltip;
    //merged.data = data1.data;
    merged.data = {};
    merged.data.columns = [];
    merged.data.columns.push(data1.data.columns[0]);
    merged.data.columns[0][0] = var1;
    merged.data.columns.push(data2.data.columns[0]);
    merged.data.columns[1][0] = var2;
    merged.data.axes = {};
    merged.data.axes[var1] = "y";
    merged.data.axes[var2] = "y2";

    merged.axis = {};
    merged.axis.x = data1.axis.x;
    merged.axis.y = data1.axis.y;
    merged.axis.y.label.text = var1.concat(" ", merged.axis.y.label.text);
    merged.axis.y2 = data2.axis.y;
    merged.axis.y2.label.text = var2.concat(" ", merged.axis.y2.label.text);
    if(var1 != var2) {
      merged.axis.y2.show = true;
    }


    return merged;


  },


  render: function () {
    var climoSeriesData = this.state.climoSeriesData ? this.state.climoSeriesData : { data: { columns: [] }, axis: {} };
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    var ids = this.props.meta.map(function (el) {
      var period = el.unique_id.split('_').slice(5)[0];
      period = period.split('-').map(function (datestring) {return datestring.slice(0, 4);}).join('-');
      var l = [el.unique_id, el.unique_id.split('_').slice(4, 5) + ' ' + period];
      return l;
    });

    return (
      <div>
        <h3>{`${this.props.model_id} ${this.props.experiment}: ${this.props.variable_id} vs ${this.props.variable2_id}`}</h3>
        <Tabs>
          <TabList>
            <Tab>Annual Cycle</Tab>
            <Tab>Projected Change</Tab>
          </TabList>
          <TabPanel>
            <Row>
              <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
                <Selector label={"Dataset"} onChange={this.updateAnnCycleDataset} items={ids} />
              </Col>
            </Row>
            <DataGraph data={timeSeriesData.data} axis={timeSeriesData.axis} tooltip={timeSeriesData.tooltip} />
          </TabPanel>
          <TabPanel>
            <Row>
              <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
                <TimeOfYearSelector onChange={this.updateProjChangeTimeOfYear} />
              </Col>
            </Row>
            <DataGraph data={climoSeriesData.data} axis={climoSeriesData.axis} tooltip={climoSeriesData.tooltip} />
          </TabPanel>
        </Tabs>
      </div>
    );
  },
});

export default DualDataController;
