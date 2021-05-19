// Very simple table intended to display some number of attribute/value pairs
// about a single object, rather than offering comparisons of multiple objects 
// as the DataTable does.
// Data shouuld have an attribute, a value, and units.

import PropTypes from 'prop-types';
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class AttributeValueTable extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    options: PropTypes.object,
  };

  render() {
    return (
      <div id={'table'}>
        <BootstrapTable
          data={this.props.data}
          options={this.props.options}
          striped
          hover
        >
            <TableHeaderColumn
            dataField='attribute'
            dataAlign='center'
            width='20%'
          >
            Attribute
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='value' isKey
            dataAlign='center'
            width='20%'
          >
            Value
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='units'
            dataAlign='center'
            width='20%'
          >
            Units
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

export default AttributeValueTable;
