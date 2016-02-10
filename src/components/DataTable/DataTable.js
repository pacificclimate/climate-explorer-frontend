import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { parseBootstrapTableData, exportTableDataToSpreadsheet } from './util';
import * as filesaver from 'filesaver.js';

var DataTable = React.createClass({

    handleClick: function(data) {
        var ss_data = exportTableDataToSpreadsheet(data);

        var xlsx_data = new Blob([ss_data],{type:""});
        // TODO: need to pull in info about selected ensemble, variable, time of year, etc. to make better filename
        filesaver.saveAs(xlsx_data, "ClimateExplorerDataTableExport.xlsx");
    },

    render: function () {
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
                <Button onClick={this.handleClick.bind(this,tableData)}>Export Table Data</Button>
            </div>
        )
    }
});

export default DataTable;
