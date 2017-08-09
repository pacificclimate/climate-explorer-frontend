import _ from 'underscore';
import urljoin from 'url-join';
import axios from 'axios';
import {exportDataToWorksheet, 
        generateDataCellsFromC3Graph} from '../../core/export';
import {validateProjectedChangeData, 
        validateStatsData, 
        validateAnnualCycleData} from '../../core/util';

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
    exportDataToWorksheet("stats", this.props, this.state.statsData, format, {timeidx: this.state.dataTableTimeOfYear});
  },

  exportTimeSeries: function(format) {
    exportDataToWorksheet("timeseries", this.props, this.state.timeSeriesData, format, {dataset: this.state.timeSeriesDatasetId});
  },

  exportClimoSeries: function(format) {
    exportDataToWorksheet("climoseries", this.props, this.state.climoSeriesData, format, {timeidx: this.state.projChangeTimeOfYear});
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

  getDataPromise: function (props, timeres, timeidx) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'data'),
      params: {
        ensemble_name: CE_ENSEMBLE_NAME,
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        timescale: timeres,
        area: props.area || "",
        time: timeidx,
      }
    }).then(validateProjectedChangeData);
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
    }).then(validateStatsData);
  },

  getTimeseriesPromise: function (props, timeSeriesDatasetId) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'timeseries'),
      params: {
        id_: timeSeriesDatasetId || null,
        variable: props.variable_id,
        area: props.area || "",
      }
    }).then(validateAnnualCycleData);
  },

    /*
     * this function is called to display any error generated in the 
     * process of showing a graph or table, so it handles networking
     * errors thrown by axios calls and errors thrown by validators 
     * and parsers, which have different formats.
     */
    displayError: function(error, displayMethod) {
      if(error.response) { // axios error: data server sent a non-200 response
        displayMethod("Error: " + error.response.status + " received from data server.");
      }else if(error.request) { // axios error: data server didn't respond
        displayMethod("Error: no response received from data server.");
      }else {  
        // either an error thrown by a data validation function,
        // an error thrown by the DataGraph or DataTable parsers,
        // or the generic and somewhat unhelpful "Network Error" from axios
        // Testing turned up "Network Error" in two cases:
        // the server is down, or the server has a 500 error.
        // Other http error statuses tested were reflected in
        // error.response.status as expected
        // (see https://github.com/mzabriskie/axios/issues/383)
        displayMethod(error.message);
      }
    },
    
    /*
     * Given a dataset's metadata, returns metadata for a dataset that
     * has the same values for all attributes except unique_id and any 
     * attribute:value pairs listed in the "difference" argument.
     * Example: findMatchingMetadata(monthlyDataset, {timescale: "annual"}) 
     * would return the annual dataset that corresponds to a monthly one.
     * Returns only one dataset's metadata even if multiple qualify.
     */
    findMatchingMetadata: function(example, difference, meta = this.props.meta) {
      var template = {};
      for(var att in example) {
        if(att != "unique_id" && att != "variable_name") {
          template[att] = difference[att] ? difference[att] : example[att];
        }
      }
      return _.findWhere(meta, template);
    },
    
    //Returns the metadata object that corresponds to a unique_id
    getMetadata: function (id, meta = this.props.meta) {
      return _.find(meta, function(m) {return m.unique_id === id;} );
    },
    
    /*
     * Filters data from any call to the API that returns an object with 
     * individual values keyed to unique_ids. It returns a new object 
     * that contains only results from datasets whose metadata matches the 
     * attributes passed to the filter argument. 
     * 
     * This is a temporary stopgap until this issue is solved:
     * https://github.com/pacificclimate/climate-explorer-backend/issues/61
     * FIXME: remove this function and calls to it when issue 61 is solved.
     */
    filterAPIResults: function(data, filter, metadata = this.props.meta) {
      var filtered = {};
      
      for(let id in data) {
        var qualified = true;
        var metad = this.getMetadata(id, metadata);
        for(let att in filter) {
          qualified = filter[att] == metad[att] ? qualified : false;
          }
        if(qualified) {
          filtered[id] = data[id];
        }
      }
      return filtered;
    },
};

export default ModalMixin;
