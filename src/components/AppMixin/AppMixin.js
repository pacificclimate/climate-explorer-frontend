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
import {timestampToYear} from '../../core/util';

var findEnsemble = function(props) {
    return (props.params && props.params.ensemble_name) || props.ensemble_name || CE_ENSEMBLE_NAME;
};

var AppMixin = {
  getInitialState: function () {
    return {
      ensemble_name: findEnsemble(this.props),
      model_id: '',
      variable_id: '',
      experiment: '',
      area: undefined,  // geojson object
      meta: [],
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      ensemble_name: findEnsemble(nextProps),
    });
  },

  //query, parse, and store metadata for all datasets
  componentDidMount: function () {
    this.updateMetadata();
  },

  updateMetadata: function () {
    var models = [];
    var vars;

    // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/124
    axios({
      baseURL: urljoin(CE_BACKEND_URL, 'multimeta'),
      params: { ensemble_name: this.state.ensemble_name },
      }).then(response => {
        for (var key in response.data) {
          vars = Object.keys(response.data[key].variables);

          for (var v in vars) {
            var start = timestampToYear(response.data[key].start_date);
            var end = timestampToYear(response.data[key].end_date);

            //If this app has a dataset filter defined, filter the data
            if(typeof this.datasetFilter == "undefined" ||
                this.datasetFilter(response.data[key])) {
              models.push(_.extend({
                unique_id: key,
                variable_id: vars[v],
                start_date: start,
                end_date: end,
                variable_name: response.data[key].variables[vars[v]],
                }, _.omit(response.data[key], 'variables', 'start_date', 'end_date')));
            }
          }
        }

        // Merge the selection information
        //
        // If it has not already been set or the current selection
        // is not available from the current metadata, simply use
        // the first available

        const {model_id, variable_id, experiment} = _.mapObject(_.pick(this.state, 'model_id', 'variable_id', 'experiment'), (val, key) => {
            return _.contains(_.pluck(models, key), val) ? val : models[0][key];
        });

        this.setState({
          meta: models,
          model_id,
          variable_id,
          experiment,
        });
    });
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
  },

  componentDidUpdate: function(nextProps, nextState) {
    // The metadata needs to be updated if the ensemble has changed
    if (nextState.ensemble_name !== this.state.ensmeble_name) {
      this.updateMetadata();
    }
  },

  /*
   * Called when user sets an area on the MapController. Propagates the area 
   * chosen to a DataController.
   */
  handleSetArea: function (geojson) {
    this.setState({ area: geojson });
  },

  /*
   * Return metadata from all datasets that match the currently selected model,
   * emissions scenario, and either selected variable or one supplied as an argument.
   */
  getfilteredMeta: function (variableFilter = this.state.variable_id) {
    var l = this.state.meta.filter(function (x) {
      return x.model_id === this.state.model_id && x.experiment === this.state.experiment && x.variable_id === variableFilter;
    }, this);
    l.sort(function (a, b) {return a.unique_id > b.unique_id ? 1 : -1;});
    return l;
  },

  /*
   * Creates an array of [variable name, variable description] tuples to populate
   * variable selection dropdowns.
   */
  getVariableIdNameArray: function () {
    var varArray = _.zip(this.getMetadataItems('variable_id'), this.getMetadataItems('variable_name'));
    var varNames = _.map(varArray, function (v) {
      return v[0] + ' - ' + v[1];
    });
    var varOptions = _.zip(this.getMetadataItems('variable_id'), varNames).sort(function (a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    return varOptions;
  },
  
  /*
   * Records user choices for model, emissions scenario, or variable(s) in state.
   */
  updateSelection: function (param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  /*
   * Returns a list of all unique values for a metadata attribute
   * like model or emissions scenario. Used to populate selection menus.
   */
  getMetadataItems: function (name) {
    return _.unique(this.state.meta.map(function (el) {return el[name];}));
  },

  /*
   * Examines all datasets matching filter, and returns a list of each unique value
   * for the named metadata attribute found in the filtered datasets. For example:
   * getFilteredMetadataItems("variable_id", {model: "CanESM2"}) 
   * would return the list of all variables in datasets from the CanESM2 model.
   */
  getFilteredMetadataItems: function (name, filter) {
    return _.unique(_.pluck(_.where(this.state.meta, filter), name));
  },

  /*
   * Generates an array to populate a selector.
   * Accepts an array of either keys or [key, description] tuples and a
   * checklist array of keys. Returns an array of [key, description, disabled]
   * tuples where any key not present in the checklist array has "disabled" set
   * to true and description is the same as key if no description provided.
   */
  markDisabledMetadataItems: function(items, checklist) {
    return _.map(items, item => {
      var key = _.isArray(item) ? item[0] : item;
      var description = _.isArray(item) ? item[1] : item;
      var disabled = checklist.indexOf(key) == -1;
      return([key, description, disabled]);
    });
  }
};

export default AppMixin;
