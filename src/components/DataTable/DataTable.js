import PropTypes from 'prop-types';
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class DataTable extends React.Component {
  static propTypes = {
    data: PropTypes.array,
  };

  render() {
    return (
      <div id={'table'}>
        <BootstrapTable data={this.props.data} options={this.props.options} striped hover >
          <TableHeaderColumn
            dataField='run'
            dataAlign='center'
            dataSort
            width='12%'
          >
            Run
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='model_period' isKey
            dataAlign='center'
            dataSort
            width='15%'
          >
            Averaging Period
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='min'
            dataAlign='center'
            dataSort
            width='12%'
          >
            Min
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='max'
            dataAlign='center'
            dataSort
            width='12%'
          >
            Max
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='mean'
            dataAlign='center'
            dataSort
            width='12%'
          >
            Mean
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='median'
            dataAlign='center'
            dataSort
            width='12%'
          >
            Median
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='stdev'
            dataAlign='center'
            dataSort
            width='12%'
          >
            Std.Dev
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField='units'
            dataAlign='center'
            width='15%'
          >
            Units
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

export default DataTable;
