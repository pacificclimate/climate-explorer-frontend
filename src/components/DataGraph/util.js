var moment = require("moment/moment");

var parseC3Data = function(graph_data) {

    var modelName = String(graph_data['id']);
    var yUnits = String(graph_data['units']);
    var dataLabel = modelName.concat("_".concat(yUnits));
    var C3Data = {columns:[], axes: {dataLabel:'y'}};
    var dataSeries = [dataLabel];

    var axisInfo = { 
        x: { type:'category', categories:[] },
        y: { label: { 'text': yUnits, 'position':'outer-middle' }} 
    };
    for (let key in graph_data['data']) {
        var val = graph_data['data'][key];
        var timestep = moment(key, moment.ISO_8601);
        axisInfo['x']['categories'].push(timestep.format('MMMM'));
        dataSeries.push(val);
    }              

    C3Data['columns'].push(dataSeries);   
       
    console.log(C3Data);
    console.log(axisInfo);
    return [C3Data, axisInfo];
}

export default parseC3Data