import _ from 'underscore';
import urljoin from 'url-join';

var AppMixin = {
  getInitialState: function () {
    return {
      meta: [],
    };
  },

  componentDidMount: function () {
    var models = [];
    var vars;
    $.ajax({
      url: urljoin(CE_BACKEND_URL, 'multimeta'),
      data: { ensemble_name: CE_ENSEMBLE_NAME },
      crossDomain: true,
    }).done(function (data) {
      for (var key in data) {
        vars = Object.keys(data[key].variables);

        for (var v in vars) {
          models.push(_.extend({
            unique_id: key,
            variable_id: vars[v],
            variable_name: data[key].variables[vars[v]],
          }, _.omit(data[key], 'variables')));
        }
      }

      this.setState({
        meta: models,
        model_id: models[0].model_id,
        variable_id: models[0].variable_id,
        experiment: models[0].experiment,
      });
    }.bind(this));
  },

  handleSetArea: function (wkt) {
    this.setState({ area: wkt });
  },

  getfilteredMeta: function () {
    var l = this.state.meta.filter(function (x) {
      return x.model_id === this.state.model_id && x.experiment === this.state.experiment && x.variable_id === this.state.variable_id;
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
};

export default AppMixin;
