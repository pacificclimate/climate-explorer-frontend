// DEPRECATED: DO NOT MAINTAIN THIS MODULE. REMOVE WHEN SOLE REMAINING
// DEPENDENCY IS REMOVED.
//
// We are moving away from mixins.
// (see [Mixins Considered Harmful](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)
// This mixin is no longer relevant, since it is only used in the deprecated
// component MotiDataController. Dependence on it has been removed from all other
// data controllers.

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
 * - initialize data state on component loading
 * - export data to csv or xls file
 * - filter and manipulate data
 *********************************************************************/

import _ from "lodash";
import urljoin from "url-join";
import {
  exportDataToWorksheet,
  generateDataCellsFromC3Graph,
} from "../../core/export";
import {
  validateLongTermAverageData,
  validateStatsData,
  validateAnnualCycleData,
  validateUnstructuredTimeseriesData,
} from "../../core/util";

var ModalMixin = {
  verifyParams: function (props) {
    var stringPropList = _.values(
      _.pick(
        props,
        "ensemble_name",
        "meta",
        "model_id",
        "variable_id",
        "experiment",
      ),
    );
    return stringPropList.length > 0 && stringPropList.every(Boolean);
  },

  componentDidMount: function () {
    if (this.verifyParams(this.props)) {
      this.getData(this.props);
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.verifyParams(nextProps) && nextProps.meta.length > 0) {
      this.getData(nextProps);
    } else {
      //Didn't receive any valid data.
      //Most likely cause in production would be the user selecting
      //parameters (rcp, model, variable) for which no datasets have been
      //added to the database yet.
      //In development, could be API or ensemble misconfiguration, database down.
      //Display an error message on each viewer in use by this datacontroller.
      var text = "No data matching selected parameters available";
      var viewerMessageDisplays = [this.displayNoDataMessage];
      _.each(viewerMessageDisplays, function (display) {
        if (typeof display == "function") {
          display(text);
        }
      });
    }
  },

  exportDataTable: function (format) {
    exportDataToWorksheet("stats", this.props, this.state.statsData, format, {
      timeidx: this.state.dataTableTimeOfYear,
      timescale: this.state.dataTableTimeScale,
    });
  },

  injectRunIntoStats: function (data) {
    // Injects model run information into object returned by stats call
    _.map(
      data,
      function (val, key) {
        var selected = this.props.meta.filter(function (el) {
          return el.unique_id === key;
        });
        _.extend(val, { run: selected[0].ensemble_member });
      }.bind(this),
    );
    return data;
  },

  //Returns the metadata object that corresponds to a unique_id
  getMetadata: function (id, meta = this.props.meta) {
    return _.find(meta, function (m) {
      return m.unique_id === id;
    });
  },

  //Used to render uninitialized stats tables
  blankStatsData: [],
};

export default ModalMixin;
