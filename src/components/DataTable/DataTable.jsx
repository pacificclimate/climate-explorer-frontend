import PropTypes from "prop-types";
import React from "react";
import TableView, { Column } from "../TableView/TableView";

class DataTable extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    options: PropTypes.object,
  };

  render() {
    return (
      <div id={"table"}>
        <TableView
          data={this.props.data}
          options={this.props.options}
          striped
          hover
        >
          <Column dataField="run" dataAlign="center" dataSort width="12%">
            Run
          </Column>
          <Column
            dataField="model_period"
            isKey
            dataAlign="center"
            dataSort
            width="15%"
          >
            Averaging Period
          </Column>
          <Column dataField="min" dataAlign="center" dataSort width="12%">
            Min
          </Column>
          <Column dataField="max" dataAlign="center" dataSort width="12%">
            Max
          </Column>
          <Column dataField="mean" dataAlign="center" dataSort width="12%">
            Mean
          </Column>
          <Column dataField="median" dataAlign="center" dataSort width="12%">
            Median
          </Column>
          <Column dataField="stdev" dataAlign="center" dataSort width="12%">
            Std.Dev
          </Column>
          <Column dataField="units" dataAlign="center" width="15%">
            Units
          </Column>
        </TableView>
      </div>
    );
  }
}

export default DataTable;
