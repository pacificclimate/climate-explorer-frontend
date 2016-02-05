import XLSX from 'xlsx';
// set the decimal precision of displayed values
var PRECISION = 2; 

var parseBootstrapTableData = function(data) {
    var flatData = [];
    var model_count = 0;
    for (let model in data) {
        var year_range_re = new RegExp("[0-9]{8}","g");
        var year_range = [];
        var lastIndex = 0;
        while (year_range_re.test(model)){
            year_range_re.lastIndex = lastIndex;
            year_range.push(year_range_re.exec(model)[0].slice(0,4));
            lastIndex = year_range_re.lastIndex;
        }
        var period = year_range[0] + " - " + year_range[1];
        var modelInfo = {
            "run": data[model]['run'],
            "model_period": period, 
            "min": +data[model]['min'].toFixed(PRECISION),
            "max": +data[model]['max'].toFixed(PRECISION),
            "w_mean": +data[model]['mean'].toFixed(PRECISION),
            "median": +data[model]['median'].toFixed(PRECISION),
            "w_stdev": +data[model]['stdev'].toFixed(PRECISION),
            "units": data[model]['units']
        };
        flatData.push(modelInfo); 
    }
    return flatData;
}


var exportTableDataToSpreadsheet = function(data){
    console.log('exportTableDataToSpreadsheet!')
    console.log(data)
    // Create workbook object containing one or more worksheets
    var wb = {}
    wb.Sheets = {};
    wb.SheetNames = [];
    var ws = {};
    var ws_name = "CE_DataTable_export"; // TODO: need to pull in info about selected ensemble to make better ws_name
    var num_rows = Object.keys(data).length;
    var num_cols = Object.keys(data[0]).length
    var range = {s: {c:0, r:0}, e: {c:num_cols, r:num_rows }};

    var column_labels = ["Model Period", "Run", "Min", "Max", "W.Mean", "Median", "W.Std.Dev", "Units" ]
    var short_labels = ["model_period", "run", "min", "max", "w_mean", "median", "w_stdev", "units" ]

    for(var R = -1; R != num_rows; ++R){
        for(var C = 0; C != num_cols; ++C){
            // create header row
            if(R == -1) var cell = {v: column_labels[C]};
            // create cell object: .v is the actual data
            else var cell = {v: data[R][short_labels[C]]};
            if(cell.v == null) continue;
            // create the correct cell reference
            var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
            // determine the cell type 
            if(typeof cell.v === 'number') cell.t = 'n';
            else cell.t = 's';
            // add to worksheet object
            ws[cell_ref] = cell;
        }
    }
    ws['!ref'] = XLSX.utils.encode_range(range);

    // add worksheet to workbook
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    console.log(wb)
    // write to file
    XLSX.writeFile(wb, 'test.xlsx');
}

export { parseBootstrapTableData, exportTableDataToSpreadsheet }
