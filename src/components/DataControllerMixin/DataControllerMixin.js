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
        ensemble_name: CE_ENSEMBLE_NAME,
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx,
      },
    }).then(function(data, textstatus, jqXHR) {
      if($.isEmptyObject(data)) {
        return $.Deferred().reject(jqXHR, "empty", textstatus);
      }
      for(var run in data) {
        if(!('data' in data[run]) || !('units' in data[run])){
          return $.Deferred().reject(jqXHR, "incomplete", textstatus);            
        }
      }
      return $.Deferred().resolve(data, textstatus, jqXHR);
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
    }).then(function(data, textstatus, jqXHR){
      if($.isEmptyObject(data)) {
        return $.Deferred().reject(jqHXR, "empty", textstatus);
      }
      for(var file in data) {
        if(!('mean' in data[file])|| !('stdev' in data[file]) || 
           !('min' in data[file]) || !('max' in data[file]) || 
           !('median' in data[file]) || !('ncells' in data[file]) || 
           !('units' in data[file]) || !('time' in data[file])) {
            return $.Deferred().reject(jqXHR, "incomplete", textstatus);
        }
      }
      return $.Deferred().resolve(data,textstatus,jqXHR);
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
    }).then(function (data, textstatus, jqXHR) {
      if($.isEmptyObject(data)) {
        return $.Deferred().reject(jqXHR, "empty", textstatus);
      }
      else if(!('id' in data) || !('units' in data) || !('data' in data)) {
        return $.Deferred().reject(jqXHR, "incomplete", textstatus);
      }
      return $.Deferred().resolve(data, textstatus, jqXHR);
    });
  },
  
  errorDescription: function (errorCode) {
    
    var errorMessages = {
        "nocontent": "Error: requested data not available from this dataset",
        "timeout": "Error: Data server timed out",
        "parsererror": "Error: Data server misconfigured",
        "abort": "Error: Connection to data server broken",
        "error": "Error: Data server internal error",
        "incomplete": "Error: Incomplete data received from data server",
        "empty": "Error: requested model and emissions scenario data unavailable"
    };
    
    if(errorCode in errorMessages) {
      return errorMessages[errorCode];
    }
    else {
      return "Unexpected error: " + errorCode;
    }
  },
  
};

export default ModalMixin;
