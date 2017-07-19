import _ from 'underscore';
import urljoin from 'url-join';
import axios from 'axios';

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
            models.push(_.extend({
              unique_id: key,
              variable_id: vars[v],
              variable_name: response.data[key].variables[vars[v]],
              }, _.omit(response.data[key], 'variables')));
            }
          }

         this.setState({
         meta: models,
         model_id: models[0].model_id,
         variable_id: models[0].variable_id,
         experiment: models[0].experiment,
         });
         this.bodgeClimatologyPeriodIntoMetadata();
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
    var varArray = _.zip(this.getMetadataItems('variable_id'), this.getMetadataItems('variable_name'));
    var varNames = _.map(varArray, function (v) {
      return v[0] + ' - ' + v[1];
    });
    var varOptions = _.zip(this.getMetadataItems('variable_id'), varNames).sort(function (a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    return varOptions;
  },

  updateSelection: function (param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  getMetadataItems: function (name) {
    return _.unique(this.state.meta.map(function (el) {return el[name];}));
  },
  
  //this VERY TEMPORARY function is a placeholder for metadata calls eventually
  //returning climatology period information
  //FIXME: get rid of this function when possible.
  bodgeClimatologyPeriodIntoMetadata: function () {
    for(var i = 0; i < this.state.meta.length; i++) {
      var params = this.state.meta[i].unique_id.split('_');
      var dates = params[6].split('-');
      this.state.meta[i].start_date = dates[0].slice(0, 4);
      this.state.meta[i].end_date = dates[1].slice(0, 4);
    }
    console.log(this.state);
  },
  
};

export default AppMixin;
