/*********************************************************************
 * DataControllerMixin.js - shared functionality for data controllers
 * 
 * This mixin is added to MotiDataController, DataController, and 
 * DualDataController. Those three controller components have different
 * viewers (graphs, tables) and UI elements (labels, selectors), 
 * but similar back-end data handling. The back-end data handling is 
 * provided by this mixin.
 * 
 * Provides functions to:
 * - fetch data from the backend API
 * - initialize data state on component loading
 * - export data to csv or xls file
 * - filter and manipulate data
 *********************************************************************/

import _ from 'underscore';
import urljoin from 'url-join';
import axios from 'axios';
import {exportDataToWorksheet, 
        generateDataCellsFromC3Graph} from '../../core/export';
import {validateLongTermAverageData,
        validateStatsData, 
        validateAnnualCycleData,
        validateUnstructuredTimeseriesData} from '../../core/util';

var ModalMixin = {

  verifyParams: function (props) {
    var stringPropList = _.values(_.pick(props, 'ensemble_name', 'meta', 'model_id', 'variable_id', 'experiment'));
    return (stringPropList.length > 0) && stringPropList.every(Boolean);
  },

  componentDidMount: function () {
    if (this.verifyParams(this.props)) {
      this.getData(this.props);
    }
  },


  componentWillReceiveProps: function (nextProps) {
    if (this.verifyParams(nextProps) && nextProps.meta.length > 0) {
      this.getData(nextProps);
    }
    else { //Didn't receive any valid data.
      //Most likely cause in production would be the user selecting
      //parameters (rcp, model, variable) for which no datasets have been
      //added to the database yet.
      //In development, could be API or ensemble misconfiguration, database down.
      //Display an error message on each viewer in use by this datacontroller.
      var text = "No data matching selected parameters available";
      var viewerMessageDisplays = [this.setStatsTableNoDataMessage];
      _.each(viewerMessageDisplays, function(display) {
        if(typeof display == 'function') {
          display(text);
        }
      });
    }
  },

  exportDataTable: function (format) {
    exportDataToWorksheet("stats", this.props, this.state.statsData, format, 
        {timeidx: this.state.dataTableTimeOfYear, timeres:this.state.dataTableTimeScale});
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

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/124
  //Fetches and validates data from a call to the backend's
  //"multistat" API endpoint
  getStatsPromise: function (props, timeidx) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'multistats'),
      params: {
        ensemble_name: props.ensemble_name,
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx,
      }
    }).then(validateStatsData);
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

    //Used to render uninitialized stats tables
    blankStatsData: []
};

export default ModalMixin;
