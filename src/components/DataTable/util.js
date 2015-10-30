var parseBootstrapTableData = function(data){
    var flatData = [];
    for (let model in data) {
        var modelInfo = {
            "model_id": String(model), 
            "min": data[model]['min'],
            "max": data[model]['max'],
            "mean": data[model]['mean'],
            "median": data[model]['median'],
            "stdev": data[model]['stdev'],
            "units": data[model]['units']
        };
        flatData.push(modelInfo); 
    }
    return flatData;
};

export default parseBootstrapTableData