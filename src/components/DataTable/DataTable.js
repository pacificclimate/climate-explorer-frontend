import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { parseBootstrapTableData, exportTableDataToSpreadsheet } from './util';

var DataTable = React.createClass({

    // propTypes: {
    //     tableData: React.PropTypes.object
    // },

    handleClick: function(data) {
        // exportTableDataToSpreadsheet(this.props.data);
        exportTableDataToSpreadsheet(data);
    },

    render: function () {

        // var tableData = parseBootstrapTableData(this.props.data);
        var tableData = parseBootstrapTableData(this.props.data);

        return (
            <div id={'table'}>
                <BootstrapTable data={tableData} striped={true} hover={true} >
                    <TableHeaderColumn dataField="model_period" isKey={true} dataAlign="center" dataSort={true}>Model Period</TableHeaderColumn>
                    <TableHeaderColumn dataField="run" dataAlign="center" dataSort={true}>Run</TableHeaderColumn>
                    <TableHeaderColumn dataField="min" dataAlign="center" dataSort={true}>Min</TableHeaderColumn>
                    <TableHeaderColumn dataField="max" dataAlign="center" dataSort={true}>Max</TableHeaderColumn>
                    <TableHeaderColumn dataField="w_mean" dataAlign="center" dataSort={true}>W.Mean</TableHeaderColumn>
                    <TableHeaderColumn dataField="median" dataAlign="center" dataSort={true}>Median</TableHeaderColumn>
                    <TableHeaderColumn dataField="w_stdev" dataAlign="center" dataSort={true}>W.Std.Dev</TableHeaderColumn>
                    <TableHeaderColumn dataField="units" dataAlign="center" dataSort={true}>Units</TableHeaderColumn>
                </BootstrapTable>
                <Button onClick={this.handleClick.bind(this,tableData)}>Export</Button>
            </div>
        )
    }
});

export default DataTable;
