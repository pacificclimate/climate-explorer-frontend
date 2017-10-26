/****************************************************************************
 * AppMixin.js - shared functionality for top-level App Controller Components
 * 
 * This class contains data retrieval and parsing methods used to initialize
 * Climate Explorer. It is mixed in to all three of the top level controllers, 
 * each of which represents a portal accessible from a separate URL:
 * 
 * - MotiController (simplified interface and UI)
 * - AppController (displays lots of detail, the default)
 * - DualController (displays two variables at once for comparison)
 * 
 ****************************************************************************/

import _ from 'underscore';
import urljoin from 'url-join';
import axios from 'axios';
import moment from 'moment';

var AppMixin = {
  getInitialState: function () {
    return {
      meta: [],
    };
  },

  componentDidMount: function () {
    var models = [];
    var vars;

    axios({
      baseURL: urljoin(CE_BACKEND_URL, 'multimeta'),
      params: { ensemble_name: CE_ENSEMBLE_NAME },
      }).then(response => {
        for (var key in response.data) {
          vars = Object.keys(response.data[key].variables);

          for (var v in vars) {
            var start = response.data[key].start_date;
            start = moment(start, moment.ISO_8601).utc().format('YYYY');
            var end = response.data[key].end_date;
            end = moment(end, moment.ISO_8601).utc().format('YYYY');

            models.push(_.extend({
              unique_id: key,
              variable_id: vars[v],
              start_date: start,
              end_date: end,
              variable_name: response.data[key].variables[vars[v]],
              }, _.omit(response.data[key], 'variables', 'start_date', 'end_date')));
            }
          }

         this.setState({
         meta: models,
         model_id: models[0].model_id,
         variable_id: models[0].variable_id,
         experiment: models[0].experiment,
         });
        });
  },

  handleSetArea: function (wkt) {
    this.setState({ area: wkt });
  },

  getfilteredMeta: function (variableFilter = this.state.variable_id) {
    var l = this.state.meta.filter(function (x) {
      return x.model_id === this.state.model_id && x.experiment === this.state.experiment && x.variable_id === variableFilter;
    }, this);
    l.sort(function (a, b) {return a.unique_id > b.unique_id ? 1 : -1;});
    return l;
  },

  getVariableIdNameArray: function () {
    var descriptions = {};
    _.each(this.state.meta, m => {
      var variable = m.variable_id;
      descriptions[variable] = this.getMergedVariableDescription(variable) ?
          this.getMergedVariableDescription(variable) : m.variable_name;
    });

    var varArray = _.zip(_.keys(descriptions), _.values(descriptions));
    var varNames = _.map(varArray, function (v) {
      return v[0] + ' - ' + v[1];
    });
    var varOptions = _.zip(this.getMetadataItems('variable_id'), varNames).sort(function (a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    return varOptions;

  /*****************************************************************
   * This is the old functionality of getVariableIdNameAray, which
   * is more straightforward and efficient. It should be restored
   * when the metadata is fixed to remove variable_ids with
   * conflicting descriptions.
   *****************************************************************
   * var varArray = _.zip(this.getMetadataItems('variable_id'), this.getMetadataItems('variable_name'));
   * var varNames = _.map(varArray, function (v) {
   *   return v[0] + ' - ' + v[1];
   * });
   * var varOptions = _.zip(this.getMetadataItems('variable_id'), varNames).sort(function (a, b) {
   *   return a[0] > b[0] ? 1 : -1;
   * });
   * return varOptions;
   *******************************************************************/
  },

  //This function is a kludge to resolve variable_ids associated with more 
  //than one description. It provides a canonical description for
  //cases where multiple descriptions are associated with a single variable.
  //Typically this applies to indices calculated seperately over differnt
  //timescales, but accidentally assigned the same variable_id.
  //This function should be removed when it is no longer necessary.
  getMergedVariableDescription: function (variable) {
    var descriptions = {
        "rx1dayETCCDI":  "Maximum 1-day Precipitation",
        "txxETCCDI": "Maximum of Daily Maximum Temperature",
        "tnxETCCDI": "Maximum of Daily Minimum Temperature",
        "rx5dayETCCDI": "Maximum Consecutive 5-day Precipitation",
        "txnETCCDI": "Minimum of Daily Maximum Temperature",
        "tnnETCCDI": "Minimum of Daily Minimum Temperature"
    };
    return descriptions[variable];
  },

  updateSelection: function (param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  getMetadataItems: function (name) {
    return _.unique(this.state.meta.map(function (el) {return el[name];}));
  },  
};

export default AppMixin;
