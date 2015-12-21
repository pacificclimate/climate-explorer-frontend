// set the decimal precision of displayed values
var PRECISION = 2; 

var parseBootstrapTableData = function(data) {
    var flatData = [];
    for (let model in data) {
        // This is a hack to display the time range of the given model run
        // We probably want to figure out a better way to form / handle the "time"
        // member of the JSON object returned by multistats.py
        var period = model.slice(-17, -13) + " - " + model.slice(-8, -4);
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

// export default parseBootstrapTableData
module.exports = parseBootstrapTableData
