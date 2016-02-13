import React, { PropTypes, Component } from 'react';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import parseBootstrapTableData from './util';

var DataTable = React.createClass({

  render: function () {

    var tableData = parseBootstrapTableData(this.props.data);

    return (
            <div id={'table'}>
                <BootstrapTable data={tableData} striped hover >
                    <TableHeaderColumn dataField="time" isKey dataAlign="center" dataSort>Model Period</TableHeaderColumn>
                    <TableHeaderColumn dataField="run" dataAlign="center" dataSort>Run</TableHeaderColumn>
                    <TableHeaderColumn dataField="min" dataAlign="center" dataSort>Min</TableHeaderColumn>
                    <TableHeaderColumn dataField="max" dataAlign="center" dataSort>Max</TableHeaderColumn>
                    <TableHeaderColumn dataField="mean" dataAlign="center" dataSort>W.Mean</TableHeaderColumn>
                    <TableHeaderColumn dataField="median" dataAlign="center" dataSort>Median</TableHeaderColumn>
                    <TableHeaderColumn dataField="stdev" dataAlign="center" dataSort>W.Std.Dev</TableHeaderColumn>
                    <TableHeaderColumn dataField="units" dataAlign="center" dataSort>Units</TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
  }
});

export default DataTable;
