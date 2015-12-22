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
            "model_id": model,
            "time": period, 
            "min": +data[model]['min'].toFixed(PRECISION),
            "max": +data[model]['max'].toFixed(PRECISION),
            "mean": +data[model]['mean'].toFixed(PRECISION),
            "median": +data[model]['median'].toFixed(PRECISION),
            "stdev": +data[model]['stdev'].toFixed(PRECISION),
            "units": data[model]['units']
        };
        flatData.push(modelInfo); 
    }
    return flatData;
}

export default parseBootstrapTableData
