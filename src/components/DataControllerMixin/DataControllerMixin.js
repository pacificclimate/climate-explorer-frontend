import _ from 'underscore';
import urljoin from 'url-join';
import { exportTableDataToWorksheet } from '../../core/util';
import axios from 'axios';

var ModalMixin = {

  verifyParams: function (props) {
    var stringPropList = _.values(_.pick(props, 'meta', 'model_id', 'variable_id', 'experiment'));
    return (stringPropList.length > 0) && stringPropList.every(Boolean);
  },

  componentDidMount: function () {
    if (this.verifyParams(this.props)) {
      this.getData(this.props);
    }
  },
  

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      timeSeriesDatasetId: nextProps.meta[0].unique_id,
    });
    if (this.verifyParams(nextProps)) {
      this.getData(nextProps);
    }
  },

  exportDataTable: function (format) {
    exportTableDataToWorksheet(this.props, this.state.statsData, format, this.state.dataTableTimeOfYear);
  },

  injectRunIntoStats: function (data) {
    // Injects model run information into object returned by stats call
    _.map(data, function (val, key) {
      var selected = this.props.meta.filter(function (el) {
        return el.unique_id === key;
      });
      _.extend(val, { run: selected[0].ensemble_member });
    }.bind(this));
    return data;
  },

  getDataPromise: function (props, timeidx) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'data'),
      params: {
        ensemble_name: CE_ENSEMBLE_NAME,
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || "",
        time: timeidx,
      }
    }).then(this.validateAnnualData);    
  },

  getStatsPromise: function (props, timeidx) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'multistats'),
      params: {
        ensemble_name: CE_ENSEMBLE_NAME,
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx,   
      }
    }).then(this.validateStatsData);
  },

  getTimeseriesPromise: function (props, timeSeriesDatasetId) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'timeseries'),
      params: {
        id_: timeSeriesDatasetId || null,
        variable: props.variable_id,
        area: props.area || "",
      }
    }).then(this.validateTimeseriesData);    
  },
    
  validateStatsData: function (response) {
    if(_.isEmpty(response.data) || (typeof response.data == "string")) {
      throw new Error("Error: statistical data unavailable for this model");
    }
    for(var file in response.data) {
      if(_.some('mean stdev min max median ncells'.split(''),
          attr => !(attr in respone.data[file]) || isNAN(response.data[file][attr])) ||
          _.some('units time'.split(' '),
              attr => !(attr in response.data[file]))) {
        throw new Error("Error: statistical data for this model is incomplete");
      }
    }
    return response;
    },
    
    validateTimeSeriesData: function(response) {
      if(_.isEmpty(response.data)) {
        throw new Error("Error: timeseries data unavailable for this model.");
      }
      if(!_.every('id units data'.split(' '), attr => attr in response.data)) {
        throw new Error("Error: timeseries data for this model is incomplete");
      }
      return response;      
    },
  
    validateAnnualData : function(response){
      if(_.isEmpty(response.data)) {
        throw new Error("Error: annual data unavailable for this model.");
      }
      for(var run in response.data) {
        if(!('data' in response.data[run]) || !('units' in response.data[run])) {
          throw new Error("Error: annual data for this model is incomplete.");
        }
      }
      return response; 
    },
    
    displayError: function(error, displayMethod) {
      if(error.response) { // data server sent a non-200 response
        displayMethod("Error: " + error.response.status + " received from data server.");
      }else if(error.request) { // data server didn't respond
        displayMethod("Error: no response received from data server.");
      }else {  // either a failed data validation
        // or a generic and somewhat unhelpful "Network Error" from axios
        // Testing turned up "Network Error" in two cases:
        // the server is down, or the server has a 500 error.
        // Other http error statuses tested were reflected in
        // error.response.status as expected
        // (see https://github.com/mzabriskie/axios/issues/383)
        displayMethod(error.message);
      }
    }
};

export default ModalMixin;
