var parseC3Data = function(data) {
    var allModelsData = {xs:{}, columns:[], axes:{}};
    var axisInfo = {};
    for (let model in data) {
        var modelName = String(model);
        var dataLabel = modelName.concat("_data");
        var dataSeries = [dataLabel];
        var xLabel = modelName.concat("_xs");
        var xSeries = [xLabel];
        var yUnits;
        allModelsData['xs'][dataLabel] = xLabel;
        for (let key in data[model]) {
            var val = data[model][key];
            if (parseInt(key)) { // this is a time series value
                xSeries.push(key);
                dataSeries.push(val);
            }
            else { // this is the units of the series
                if (String(key) === 'units' && String(data[model][key]) !== yUnits) { // don't create redundant axes
                    yUnits = String(data[model][key]);
                    var modelYaxisLabel = modelName.concat("_axis");
                    allModelsData['axes'][dataLabel] = modelYaxisLabel;
                    axisInfo[modelYaxisLabel] = {
                        'show': true,
                        'label': yUnits,
                        'position':'outer-center',
                    };
                }
            }              
        }
        allModelsData['columns'].push(xSeries);
        allModelsData['columns'].push(dataSeries);          
    }
    // console.log(allModelsData);
    // console.log(axisInfo);
    return [allModelsData, axisInfo];
}

export default parseC3Data