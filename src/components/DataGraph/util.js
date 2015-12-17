var moment = require("moment/moment");

// set the decimal precision of displayed values
var PRECISION = 2;

var parseC3Data = function(graph_data) {

    var modelName = String(graph_data['id']);
    var yUnits = String(graph_data['units']);
    // var modelName = modelName.concat(" ".concat(yUnits));
    var C3Data = {
        columns:[], 
        types: {
            modelName: 'line', 
            'Annual Average': 'step',
            'Seasonal Averages': 'step'
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
        // regions: {
        //     'Seasonal Averages': [{'start':1, 'end':2, 'style': 'dashed'}]
        // },
    };
    
    var monthlySeries = [modelName];

    var axisInfo = { 
        x: { type:'category', categories:[] },
        y: { label: { 'text': yUnits, 'position':'outer-middle' }} 
    };

    var springSeries = [];
    var summerSeries = [];
    var fallSeries = [];
    var winterSeries = [];
    var seasonalLabel = ['Seasonal Averages'];
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

    return [C3Data, axisInfo];
}

export default parseC3Data