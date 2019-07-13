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

import _ from 'lodash';
import urljoin from 'url-join';
import axios from 'axios';
import {timestampToYear} from '../../core/util';

var findEnsemble = function(props) {
  return (
    (props.match && props.match.params && props.match.params.ensemble_name) ||
    props.ensemble_name ||
    process.env.REACT_APP_CE_ENSEMBLE_NAME
  );
};

var AppMixin = {
  getInitialState: function () {
    return {
      ensemble_name: findEnsemble(this.props),
      model_id: '',
      variable_id: '',
      variable_name: '',
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
      baseURL: urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'multimeta'),
      params: { ensemble_name: this.state.ensemble_name },
      }).then(response => {
        for (var key in response.data) {
          vars = Object.keys(response.data[key].variables);

          for (var v in vars) {
            var start = timestampToYear(response.data[key].start_date);
            var end = timestampToYear(response.data[key].end_date);

            // Stopgap measure to deal with the fact that experiment string formats
            // vary between climdex files ("historical, rcp26") and GCM outputs
            // ("historical,rcp26"). Formats experiment strings to include a space.
            // This formatting is undone to run queries against the database by
            // ce-backend.guessExperimentFormatFromVariable()
            // TODO: remove this when no longer needed.
            var normalizedExp = String(response.data[key].experiment).replace(',r', ', r');

            //If this app has a dataset filter defined, filter the data
            if(typeof this.datasetFilter == "undefined" ||
                this.datasetFilter(response.data[key])) {
              models.push(_.extend({
                unique_id: key,
                variable_id: vars[v],
                start_date: start,
                end_date: end,
                experiment: normalizedExp,
                variable_name: response.data[key].variables[vars[v]],
                }, _.omit(response.data[key], 'variables', 'start_date', 'end_date',
                    'modtime', 'experiment')));
            }
          }
        }

        // Merge the selection information
        // If a dataset is already selected, use that. Otherwise, use
        // defaults if available. Otherwise, first available.
        // Default dataset: CanESM2, rcp85, pr
        function specifiedIfAvailable(attribute, value, items) {
          return _.pluck(items, attribute).includes(value) ? value : items[0][attribute];
        }

        const model_id = this.state.model_id ? this.state.model_id :
          specifiedIfAvailable("model_id", "CanESM2", models);
        const experiment = this.state.experiment ? this.state.experiment :
          specifiedIfAvailable("experiment", "historical, rcp85", _.where(models, {model_id: model_id}));
        const variable_id = specifiedIfAvailable("variable_id", "pr",
          _.where(models, {model_id: model_id, experiment: experiment}));
        // variable_name has no default, because it must match variable_id.
        const variable_name = _.where(models, {model_id: model_id, experiment: experiment, 
          variable_id: variable_id})[0].variable_name;

        this.setState({
          meta: models,
          model_id,
          variable_id,
          variable_name,
          experiment,
        });
    });
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
  },

  componentDidUpdate: function(nextProps, nextState) {
    // The metadata needs to be updated if the ensemble has changed
    if (nextState.ensemble_name !== this.state.ensemble_name) {
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
   * At present, the user selecting a variable is a complicated by the fact
   * that some climdex datafiles have the same variable name, but different
   * variable descriptions, indicating different algorithms for calculating those
   * variables.
   * 
   * The variables for which this is the case are: rx1day, rx5day, tnn, tnx, txn, and txx
   * These minimum / maximum measurements have two different "annual" algorithms: either
   * the mean of the twelve monthly mins/maxes, or a single min/max for the whole year;
   * their descriptions are identical, but begin with either "Monthly" or "Annual" 
   * respectively.
   * 
   * In these cases, the description displayed next to the variable selected by the user
   * is important. So variable and description are selected and updated in state as a 
   * unit, instead of being handled by the generic user selection update function. Then 
   * description is used alongside variable to filter the datasets sent to data and map
   * controllers.
   * 
   * This is a stopgap solution. Longterm, we'd like to standardize the algorithms or
   * incorporate both algorithms in our data model.
   */
  handleSetVariable(variable, selection) {
    let update = {};
    update[`${variable}_id`] = selection.variable_id;
    update[`${variable}_name`] = selection.variable_name;
    this.setState(update);
  },

  /*
   * Return metadata from all datasets that match the currently selected
   * model, emissions scenario, and either selected variable, or one 
   * passed in as an argument (with optional description).
   */
  getFilteredMeta: function (variableFilter, nameFilter) {
    let filter = _.pick(this.state, "model_id", "experiment");
    if(variableFilter && nameFilter) {
      filter.variable_id = variableFilter;
      filter.variable_name = nameFilter;
    }
    else if(!variableFilter || variableFilter === this.state.variable_id) {
      filter.variable_id = this.state.variable_id;
      filter.variable_name = this.state.variable_name;
    }
    else {
      filter.variable_id = variableFilter;      
    }
    let l = _.filter(this.state.meta, filter);
    l.sort(function (a, b) {return a.unique_id > b.unique_id ? 1 : -1;});
    return l;
  },
  
  /*
   * Records user choices for model or emissions scenario in state.
   */
  updateSelection: function (param, selection) {
    var update = {}; 
    update[param] = selection;
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
