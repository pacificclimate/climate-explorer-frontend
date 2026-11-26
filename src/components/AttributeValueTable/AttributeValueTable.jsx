// Very simple table intended to display some number of attribute/value pairs
// about a single object, rather than offering comparisons of multiple objects
// as the DataTable does.
// Data shouuld have an attribute, a value, and units.

import PropTypes from "prop-types";
import React from "react";
import TableView, { Column } from "../TableView/TableView";

class AttributeValueTable extends React.Component {
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
          <Column dataField="attribute" dataAlign="center" width="20%">
            Attribute
          </Column>
          <Column dataField="value" isKey dataAlign="center" width="20%">
            Value
          </Column>
          <Column dataField="units" dataAlign="center" width="20%">
            Units
          </Column>
        </TableView>
      </div>
    );
  }
}

export default AttributeValueTable;
