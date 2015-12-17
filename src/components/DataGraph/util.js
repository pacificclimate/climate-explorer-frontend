var moment = require("moment/moment");

var allMonths = ['January', 'February', 'March', 'April', 'May',
                'June', 'July', 'August', 'September', 'October',
                'November', 'December'];

var winter = ['December', 'January', 'February'];
var spring = ['March', 'April', 'May'];
var summer = ['June', 'July', 'August'];
var fall = ['September', 'October', 'November'];

var parseC3Data = function(graph_data) {

    var modelName = String(graph_data['id']);
    var yUnits = String(graph_data['units']);
    var dataLabel = modelName.concat(" ".concat(yUnits));
    var C3Data = {
        columns:[], 
        types: {
            dataLabel: 'line', 
            'Annual Average': 'step',
            'Seasonal Averages': 'step'
        }, 
        axes: {dataLabel:'y'}
    };
    var dataSeries = [dataLabel];

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
        var val = graph_data['data'][key];
        var timestep = moment(key, moment.ISO_8601);
        var month = timestep.format('MMMM');
        if (idx < 12){
            axisInfo['x']['categories'].push(month);
            dataSeries.push(val);
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
    C3Data['columns'].push(dataSeries);   
      
    // Form series for seasonal lines
    var seasonalSeries = seasonalLabel.concat(winterSeries.slice(-2),springSeries,summerSeries,fallSeries,winterSeries.slice(0,1));
    C3Data['columns'].push(seasonalSeries);
    C3Data['columns'].push(annualSeries);

    return [C3Data, axisInfo];
}

export default parseC3Data