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
         //temporary kludge until the multimeta API is updated
         //to return climatology period data. 
         //FIXME: remove this function call when it become unnecessary.
         this.addClimatologyPeriods();
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
  
  /*
   * This function is a temporary stopgap until the backend API 
   * is modified to provide climatology period information on the
   * "multimeta" call. Currently that information is only available
   * from the "metadata" call, which must be called individually for 
   * each datafile. 
   * The [number of data files] API calls cause a noticable onetime 
   * slowdown and rerender on initial page load.
   * TODO: remove this function (and the call to it) once the multimeta
   * call provides "start_date" and "end_date" for each dataset, making 
   * this function entirely redundant.
   */
  addClimatologyPeriods: function () {
    var promises = [];
    for(var i = 0; i < this.state.meta.length; i++) {
      var sid = this.state.meta[i].unique_id;
      var promise = axios({
        baseURL: urljoin(CE_BACKEND_URL, 'metadata'),
        params: {
          model_id: sid,
        },
      });
      promises.push(promise);
    }
    Promise.all(promises).then(responses => {
      var withDates = [];
      for(var i = 0; i < responses.length; i++) {
        var pid = Object.keys(responses[i].data)[0];
        var start = responses[i].data[pid].start_date;
        start = moment(start, moment.ISO_8601).utc().format('YYYY');
        var end = responses[i].data[pid].end_date;
        end = moment(end, moment.ISO_8601).utc().format('YYYY');
        var dataset = _.find(this.state.meta, function (m) {return m.unique_id == pid;});
        dataset.start_date = start;
        dataset.end_date = end;
        withDates.push(dataset);
      }
      this.setState({ //triggers a re-render when all the API calls are done.
        meta: withDates,
      });
    });
  },
  
};

export default AppMixin;
