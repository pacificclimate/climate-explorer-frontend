import _ from 'underscore';
import urljoin from 'url-join';
import { exportTableDataToWorksheet } from '../../core/util';

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
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'data'),
      crossDomain: true,
      data: {
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx,
      },
    });
  },

  getStatsPromise: function (props, timeidx) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'multistats'),
      crossDomain: true,
      data: {
        ensemble_name: CE_ENSEMBLE_NAME,
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx,
      },
    });
  },

  getTimeseriesPromise: function (props, timeSeriesDatasetId) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'timeseries'),
      crossDomain: true,
      data: {
        id_: timeSeriesDatasetId || null,
        variable: props.variable_id,
        area: props.area || null,
      },
    });
  },

};

export default ModalMixin;
