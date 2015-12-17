var moment = require("moment/moment");

// set the decimal precision of displayed values
var PRECISION = 2;

var parseDataForC3 = function(data) {
    var allModelsData = {xs:{}, columns:[], axes:{}};
    var axisInfo = {};
    for (let model in data) {
        var modelName = String(model);
        var dataLabel = modelName.concat("_data");
        var dataSeries = [dataLabel];
        var xLabel = modelName.concat("_xs");
        var xSeries = [xLabel];
        var yUnits;
        var yAxisCount; // to accommodate plotting multiple climate variables
        allModelsData['xs'][dataLabel] = xLabel;
        for (let key in data[model]) {
            var val = data[model][key];
            if (parseInt(key)) { // this is a time series value
                xSeries.push(key);
                dataSeries.push(val);
            }
            else { // this is the units of the series, which also defines the y axes
                if (String(key) === 'units' && String(data[model][key]) !== yUnits) { // don't create redundant axes
                    yUnits = String(data[model][key]);
                    // var modelYaxisLabel = modelName.concat("_axis");
                    var modelYaxisLabel = yAxisCount ? "y".concat(yAxisCount) : "y";

                    allModelsData['axes'][dataLabel] = modelYaxisLabel;
                    axisInfo[modelYaxisLabel] = {
                        'show': true,
                        'label': {
                            'text': yUnits,
                            'position':'outer-center',
                        }
                    };
                    if (!yAxisCount){ // C3 wants y-axes labeled 'y', 'y2', 'y3'...
                        yAxisCount = 1;
                    }
                    yAxisCount++;
                }
            }              
        }
        allModelsData['columns'].push(xSeries);
        allModelsData['columns'].push(dataSeries);          
    }

    return [allModelsData, axisInfo];
}


var parseTimeSeriesForC3 = function(graph_data) {

    var modelName = String(graph_data['id']);
    var yUnits = String(graph_data['units']);
    var C3Data = {
        columns:[], 
        types: {
            modelName: 'line', 
            'Annual Average': 'step',
            'Seasonal Average': 'step'
        }, 
        labels: {
            format: {
                'Seasonal Averages': function (v, id, i, j){
                    if (i == 0 || i == 11){ return "Winter" }
                    if (i == 3) { return "Spring" }
                    if (i == 6) { return "Summer" }
                    if (i == 9) { return "Fall" }
                }
            }
        },
        axes: {modelName:'y'},
    };

    var axisInfo = { 
        x: { type:'category', categories:[] },
        y: { label: { 'text': yUnits, 'position':'outer-middle' }} 
    };

    var tooltipInfo = {
        grouped: true,
        format: {
            value: function (value) { return value + ' ' + yUnits }
        } 
    };

    var monthlySeries = [modelName];
    var springSeries = [];
    var summerSeries = [];
    var fallSeries = [];
    var winterSeries = [];
    var seasonalLabel = ['Seasonal Average'];
    var annualSeries = ['Annual Average'];

    var idx = 0;
    for (let key in graph_data['data']) {
        var val = graph_data['data'][key].toFixed(PRECISION);
        var timestep = moment(key, moment.ISO_8601);
        var month = timestep.format('MMMM');
        if (idx < 12){
            axisInfo['x']['categories'].push(month);
            monthlySeries.push(val);
        }
        else if (idx === 12){
            winterSeries.push(val, val, val);
        }
        else if (idx === 13){
            springSeries.push(val, val, val);
        }
        else if (idx === 14){
            summerSeries.push(val, val, val);
        }
        else if (idx === 15){
            fallSeries.push(val, val, val);
        }
        else if (idx === 16){
            annualSeries.push(val, val, val, val, val, val, val, val, val, val, val, val);
        }
        idx++;
    }              
    C3Data['columns'].push(monthlySeries);   
    // Form series for seasonal lines
    var seasonalSeries = seasonalLabel.concat(winterSeries.slice(-2),springSeries,summerSeries,fallSeries,winterSeries.slice(0,1));
    C3Data['columns'].push(seasonalSeries);
    C3Data['columns'].push(annualSeries);

    return [C3Data, axisInfo, tooltipInfo];
}

module.exports = { parseDataForC3, parseTimeSeriesForC3 }