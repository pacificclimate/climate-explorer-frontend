var React = require("react");
var ReactDOM = require("react-dom");
var CanadaMap = require("./components/Map/CanadaMap").CanadaMap;


var PanelOverlay = require("./components/PanelOverlay/PanelOverlay");
var DatasetList = require("./components/CheckboxList/DatasetList");
var TimeSlider = require("./components/Slider/TimeSlider");
var css = require("./styles/base.css")
var GraphOverlay = require("./components/DataGraph/GraphOverlay");
var TableOverlay = require("./components/DataTable/TableOverlay");

var App = React.createClass({


    render: function() {
        return (
            <div>
                <CanadaMap></CanadaMap>
                <PanelOverlay title={'Dataset Selection'} maxHeight={200}>
                    <DatasetList />
                </PanelOverlay>
                <PanelOverlay title={'Ensemble Selection'} maxHeight={200}>
                    <DatasetList />
                </PanelOverlay>
                <GraphOverlay />
                <TableOverlay />
                <TimeSlider />
            </div>
        )
    }

});

ReactDOM.render(<App />, document.getElementById('wrapper'));
