/******************************************************************************
 * MapController.js - a controller component to coordinate data and UI for a map.
 * 
 * Receives 1-2 arrays of netCDF dataset metadata from its parent, an AppController.
 * 
 * Collects display information (time slice, colours, scale, etc) from the user
 * via a modal menu, then passes one or two single datasets with corresponding
 * display configuration to its child, CanadaMap.
 * 
 * If it only receives one set of metadata (variable), it will pass it to 
 * CanadaMap for a raster colour map; a second set of metadata (comparand) will 
 * be additionally passed as isolines.
 * 
 * Also responsible for passing an area input by the user by drawing on the map
 * up to the AppController, to allow data for graphs to be calculated over
 * a specific area.
 *******************************************************************************/

import React from 'react';
import { Row, Col, Button,
         ButtonGroup, Glyphicon,
         Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import urljoin from 'url-join';
import Loader from 'react-loader';
import _ from 'underscore';
import axios from 'axios';

import { CanadaMap } from '../Map/CanadaMap';
import Selector from '../Selector/Selector';
import GeoExporter from '../GeoExporter';
import GeoLoader from '../GeoLoader';
import g from '../../core/geo';
import ModalMixin from '../ModalMixin';
import { timestampToTimeOfYear,
         nestedAttributeIsDefined,
         sameYear,
         getVariableOptions} from '../../core/util';

import styles from './MapController.css';

var MapController = React.createClass({

  propTypes: {
    variable: React.PropTypes.string,
    meta: React.PropTypes.array,
    comparand: React.PropTypes.string,
    comparandMeta: React.PropTypes.array,
    onSetArea: React.PropTypes.func.isRequired,
  },

  mixins: [ModalMixin],

  /*
   * State items also set from meta object array 
   * Includes:
   *  - dataset
   *  - wmstime
   *  - variable
   */
  getInitialState: function () {
    return {
      rasterLogscale: "false",
      numberOfContours: 10,
      isolineLogscale: "false",
    };
  },
  
  //this function handles user selection of all the straightforward
  //parameters like logscale or palette.
  updateSelection: function (param, selection) {
    var update = {};
    update[param] = selection;
    this.setState(update);
  },

  //update the timestamp in state
  //timeidx is a stringified object with a resolution  (monthly, annual, seasonal)
  //and an index denoting the timestamp's position with the file
  updateTime: function(dataset, timeidx) {
    var update = {};
    update[`${dataset}TimeIdx`] = timeidx;
    update[`${dataset}WmsTime`] = this.state[`${dataset}Times`][timeidx];
    this.setState(update);
  },

  //callback function for CanadaMap - is passed the results of a
  //ncWMS GetMetadata call containing the minimum and maximum of
  //a layer. Used to determine whether a layer can be viewed with
  //logarithmic scaling.
  updateLayerMinmax: function (layer, minmax) {
    this.layerRange[layer] = minmax;
  },

  //this function stores a dataset selected by the user and information
  //needed to render it to state 
  updateDataset: function (dataset) {
    this.loadMap(this.props, JSON.parse(dataset));
  },

  findUniqueId: function () {
    if (this.props.meta.length > 0) {
      return this.props.meta[0].unique_id;
    }
  },

  handleSetArea: function (geojson) {
    this.setState({ area: geojson });
    this.props.onSetArea(geojson ? g.geojson(geojson).toWKT() : undefined);
  },

  //returns true if props has all necessary information to generate
  //a map. Expected values for symbol: "variable" or "comparand"
  hasValidData: function (symbol, props = this.props) {
    var dataLocation = symbol == "variable" ? "meta" : "comparandMeta";

    return !_.isUndefined(props[dataLocation]) &&
           props[dataLocation].length > 0;
  },

  //returns a promise for metadata containing a "times" attribute
  //with an array of timestamps.
  requestTimeMetadata: function (uniqueId) {
    return axios({
      baseURL: urljoin(CE_BACKEND_URL, 'metadata'),
      params: {
        model_id: uniqueId,
      },
    });
  },

  //Load initial map, based on a list of available data files passed
  //as props from its parent
  //the 0th dataset in props.meta is displayed. This behaviour is shared by
  //the DataControllers, so initially maps and graphs will show the 
  //same data, though a user can choose to view different data with 
  //each viewer if they like.
  componentWillReceiveProps: function (nextProps) {
    
    if(this.hasValidData("variable", nextProps)) {
      var newVariableId = nextProps.meta[0].variable_id;
      var oldVariableId = this.props.meta.length > 0 ? this.props.meta[0].variable_id : undefined;
      var hasComparand = nextProps.comparandMeta && nextProps.comparandMeta.length > 0;
      if(hasComparand){
        var newComparandId = nextProps.comparandMeta.length > 0 ? nextProps.comparandMeta[0].variable_id : undefined;
        var oldComparandId = this.props.comparandMeta.length > 0 ? this.props.comparandMeta[0].variable_id : undefined;
      }
      var defaultDataset = nextProps.meta[0];
      this.layerRange = {};

      //clear stored layer value ranges.
      _.each(["raster", "isoline"], layer => {
        this.layerRange[layer] = undefined;
      });

      //check to see whether the variables displayed have been switched.
      //if so, unset logarithmic display; default is linear.
      var switchVariable = !_.isEqual(newVariableId, oldVariableId);
      var switchComparand = hasComparand && !_.isEqual(newComparandId, oldComparandId);

      //set display colours. In order of preference:
      //1. colours received by prop
      //2. colours from state (set by the user or this function previously)
      //3. colours specified in variables.yaml, if applicable (raster only)
      //4. defaults (raster rainbow if a single dataset,
      //             raster greyscale and isolines rainbow for 2)
      var sPalette, cPalette;
      if(nextProps.rasterPalette) {
        sPalette = nextProps.rasterPalette;
        cPalette = nextProps.isolinePalette;
      }
      else if(this.state.rasterPalette && !switchVariable) {
        sPalette = this.state.rasterPalette;
        cPalette = this.state.isolinePalette;
      }
      else if (!_.isUndefined(getVariableOptions(newVariableId, "defaultRasterPalette")))
      {
        sPalette = getVariableOptions(newVariableId, "defaultRasterPalette");
        if(this.hasValidData("comparand", nextProps)) {
          cPalette = 'x-Occam';
        }
      }
      else if(this.hasValidData("comparand", nextProps)){
        sPalette = 'seq-Greys';
        cPalette = 'x-Occam';
      }
      else{
        sPalette = 'x-Occam';
      }

      this.loadMap(nextProps, defaultDataset, sPalette, cPalette, switchVariable, switchComparand);
    }
    else {
      //haven't received any displayable data. Probably means user has selected
      //parameters for a dataset that isn't in the database.
      //Clear the map to prevent the previously-generated map causing confusion
      //if the user doesn't notice the footer.
      this.setState({
        variableTimes: undefined,
        variableTimeIdx: undefined
      });
    }
  },
  
  //update state with all the information needed to display
  //maps for specific datasets.
  //a "dataset" in this case is not a specific file. It is a
  //variable + emissions + model + period + run combination. Timestamps for
  //a "dataset" may be spread across up to three files (one annual, one 
  //seasonal, one monthly). MapController stores the parameters of the dataset
  //in state, but doesn't select (or store in state) a specific file with a 
  //specific unique_id until rendering, when it needs to pass an exact file
  //and timestamp to the viewer component CanadaMap.
  //The variable and the comparand may have  different available timestamps.
  loadMap: function (props, dataset, sPalette = this.state.rasterPalette, 
      cPalette = this.state.isolinePalette, newVariable = false, newComparand = false) {
    
    var run = dataset.ensemble_member;
    var start_date = dataset.start_date;
    var end_date = dataset.end_date;
    
    //generate the list of available times for one or two variable+run+period combinations.
    //which may include multiple files of different time resolutions 
    //(annual, seasonal, or monthly).
    var variableTimes = {};
    var comparandTimes = {};
    var timesPromises = [];
        
    var datasets = _.filter(props.meta, 
        {"ensemble_member": run, "start_date": start_date, "end_date": end_date });

    //if there is a comparison variable, get times from its datasets too
    if (this.hasValidData("comparand", props)) {
      datasets = datasets.concat(_.filter(props.comparandMeta, {"ensemble_member": run,
        "start_date": start_date, "end_date": end_date}));
      }

    for(var i = 0; i < datasets.length; i++) {
      timesPromises.push(this.requestTimeMetadata(datasets[i].unique_id));
    }

    Promise.all(timesPromises).then(responses => {
      for(var i = 0; i < responses.length; i++) {
        var id = Object.keys(responses[i].data)[0];
        for(var timeidx in responses[i].data[id].times) {
          var idxString = JSON.stringify({
            "timescale": responses[i].data[id].timescale,
            "timeidx": timeidx,
          });

          //This assumes only one variable per file.
          var variable = Object.keys(responses[i].data[id].variables)[0];
          if (variable == props.meta[0].variable_id) {
            variableTimes[idxString] = responses[i].data[id].times[timeidx];
          }
          if(this.hasValidData("comparand", props) && variable == props.comparandMeta[0].variable_id) {
            comparandTimes[idxString] = responses[i].data[id].times[timeidx];
          }
        }
      }
      //select a 0th index to display initially. It could be January, 
      //Winter, or Annual - there's no guarentee any given dataset 
      //will have monthly, seasonal, or yearly data available, but it
      //will have at least one of them.
      var is0thIndex = function (timestamp) {return JSON.parse(timestamp).timeidx == 0};
      
      var variableStartingIndex = _.find(Object.keys(variableTimes), is0thIndex);
      var comparandStartingIndex = _.find(Object.keys(comparandTimes), is0thIndex);

      var variable_id = props.meta[0].variable_id;
      var comparand_id = this.hasValidData("comparand", props) ? props.comparandMeta[0].variable_id : undefined;

      this.setState({
        variable: variable_id,
        comparand: comparand_id,
        run: run,
        start_date: start_date,
        end_date: end_date,
        variableTimes: variableTimes,
        variableTimeIdx: variableStartingIndex,
        variableWmsTime: variableTimes[variableStartingIndex],
        comparandTimes: comparandTimes,
        comparandTimeIdx: comparandStartingIndex,
        comparandWmsTime: comparandTimes[comparandStartingIndex],
        rasterPalette: sPalette,
        isolinePalette: cPalette,
        rasterLogscale: newVariable ? "false" : this.state.rasterLogscale,
        isolineLogscale: newComparand ? "false" : this.state.isolineLogscale
      });
    });
    
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before we have required data
    return !_.isEqual(nextState, this.state);
  },

  //This function wraps a React component in a React OverlayTrigger that
  //displays the supplied text as a tooltip when hovered over.
  addTooltipWrapper: function (component, text, direction="left") {
    var tooltip = (
        <Tooltip id="tooltip">
          {text}
        </Tooltip>
        );

    return (
        <OverlayTrigger placement={direction} overlay={tooltip} container={this}>
          <div>
            {component}
          </div>
        </OverlayTrigger>
    );
  },

  //This function returns JSX for a dropdown menu that allows a user to select a time of year
  //(month, season, or annual) to display. If the data spans more than one year, the
  //user can also select a year.
  makeTimeSelector: function (symbol) {
    var times = this.state[`${symbol}Times`]
 
    if(_.isUndefined(times)) {
      //metadata API call hasn't finished loading yet; return disabled selector. 
      //(user shouldn't see this unless something is off with backend - 
      // metadata query should be loaded by the time the user opens this menu.)
      return (
          <Selector
            label={"Year and Time of Year"}
            disabled={true}
          />
          );
    }
    var timeList = _.values(times);
    var disambiguateYears = !sameYear(_.first(timeList), _.last(timeList));
    var timeOptions = _.map(times, function (v, k) {
      return [k, timestampToTimeOfYear(v, JSON.parse(k).timescale, disambiguateYears)];
    });

    var labelText = disambiguateYears ? "Year and Time of Year" : "Time of Year";
    labelText = `${this.userLabels[symbol]} ${labelText}`;
    var value = this.state[`${symbol}TimeIdx`];

    return (
        <Selector
          label={labelText}
          onChange={this.updateTime.bind(this, symbol)}
          items={timeOptions}
          value={value}
        />
        );
  },

  //used to generate human-friendly control labels
  userLabels: {"isoline": "Isoline", "raster": "Block Colour",
    "variable": "Block Colour", "comparand": "Isoline"},

  //This function returns JSX for a colour palette selector.
  makeColourPaletteSelector: function(layer) {
    var palettes = [
      ['seq-Blues', 'light blues'],
      ['seq-BkBu', 'dark blues'],
      ['seq-Greens', 'light greens'],
      ['seq-BkGn', 'dark greens'],
      ['seq-Oranges', 'oranges'],
      ['seq-BuPu', 'purples'],
      ['seq-Greys', 'greys'],
      ['seq-BkYl', 'yellows'],
      ['x-Occam', 'rainbow'],
      ['default', 'ocean'],
      ['seq-cubeYF', 'cube'],
      ['psu-magma', 'sunset']
    ];
    //available palette list: http://goo.gl/J4Q5PD

    var userLabelText = `${this.userLabels[layer]} Palette`;

    var changeItem = `${layer}Palette`;

    return (
        <Selector
          label={userLabelText}
          onChange={this.updateSelection.bind(this, changeItem)}
          items={palettes}
          value={this.state[changeItem]}
        />
        );
  },

  //This function returns JSX for a selector allowing the user to choose
  //whether a map's colours are scaled logarithmically or linearly.
  //If a given map cannot be displayed with logscaled colour, returns an
  //empty string.
  //A map supports logscale colouring if:
  // 1) all its values are > 0, or
  // 2) the variable is marked "overrideLogarithmicScale: true" in the
  //    variable-options.yaml config file (but values will be clipped to > 0)
  makeColourScaleSelector: function(layer) {

    if(this.props.meta.length == 0) { //no data loaded (yet).
      return '';
    }

    var override = false;
    var variableName;

    if(layer == "raster"){
      variableName = this.props.meta[0].variable_id;
    }
    else {
      variableName = this.props.comparandMeta[0].variable_id;
    }

    var override = getVariableOptions(variableName, "overrideLogarithmicScale");
    var min = -1;

    if(nestedAttributeIsDefined(this.layerRange, layer, "min")) {
      min = this.layerRange[layer].min;
    }

    var colourScales = [["false", 'Linear'], ["true", 'Logarithmic']];
    var userLabelText = `${this.userLabels[layer]} Scale`;
    var callbackText = `${layer}Logscale`;
    var disabled = min <= 0 && !override;

    var dropdown = (
        <Selector
          label={userLabelText}
          disabled={disabled}
          items={colourScales}
          value={this.state[callbackText]}
          onChange={this.updateSelection.bind(this, callbackText)}
        />
        );

    if (disabled) {
      dropdown = this.addTooltipWrapper(dropdown,
          "Logarithmic scale only possible for positive datasets");
    }
    return dropdown;
  },

  //This function returns JSX for a map footer displaying information about the
  //dataset and the selected display time.
  makeMapFooter: function () {
    var dataset = `${this.state.start_date}-${this.state.end_date}`;
    var resolution = _.invert(this.state.variableTimes)[this.state.variableWmsTime];
    var times = _.values(this.state.variableTimes);
    resolution = JSON.parse(resolution).timescale;
    var disambiguateYears = !sameYear(_.first(times), _.last(times));
    var time = timestampToTimeOfYear(this.state.variableWmsTime, resolution, disambiguateYears);

    return (
        <h5>
          {dataset} {time} {this.state.run}
        </h5>
        );    
  },

  //renders a CanadaMap, menu buttons, and a dialog box with a lot of view options
  render: function () {

    //generate UI selectors: palette and scale for both isolines and blocks,
    //run and period dropdown, time of year selector, number of isolines

    var datasetSelector, rasterScaleSelector, rasterPaletteSelector, rasterTimeSelector;
    var isolineScaleSelector, isolinePaletteSelector, numContoursSelector, isolineTimeSelector;
    var rasterControls, isolineControls;
    
    //run and period selector
    //displays a list of all the unique combinations of run + climatological period
    //a user could decide to view.
    //Not sure JSON is the right way to do this, though.
    //TODO: see if there's a more elegant way to handle the callback 
    //(selector won't pass an object)
    var ids = this.props.meta.map(function (el) {
        return [JSON.stringify(_.pick(el, 'start_date', 'end_date', 'ensemble_member')),
            `${el.ensemble_member} ${el.start_date}-${el.end_date}`];
    });
    ids = _.uniq(ids, false, function(item){return item[1]});

    var datasetSelector;
    var selectedDataset = JSON.stringify({
      start_date: this.state.start_date,
      end_date: this.state.end_date,
      ensemble_member: this.state.run
    });
    if (ids.length > 1) {
      datasetSelector = (<Selector
        label={"Select Dataset"}
        onChange={this.updateDataset}
        items={ids}
        value={selectedDataset}
      />);
    }

    rasterTimeSelector = this.makeTimeSelector("variable");
    rasterScaleSelector = this.makeColourScaleSelector("raster");
    rasterPaletteSelector = this.makeColourPaletteSelector("raster");

    //configuration options and selectors for the second dataset, if it exists
    if(this.hasValidData("comparand")) {
      isolinePaletteSelector = this.makeColourPaletteSelector("isoline");
      isolineScaleSelector = this.makeColourScaleSelector("isoline");
      isolineTimeSelector = this.makeTimeSelector("comparand");

      numContoursSelector = (
        <Selector
          label={"Number of Isolines"}
          onChange={this.updateSelection.bind(this, 'numberOfContours')}
          items={[4, 6, 8, 10, 12]}
          value={this.state.numberOfContours}
        />
      );
    }

    //generate the map and footer
    //determine which files (annual, seasonal, monthly?) 
    //actually contain the requested timestamps.
    var rasterDatasetID;
    var isolineDatasetID;

    if(this.state.variableTimeIdx) {
      var timeindex = JSON.parse(this.state.variableTimeIdx);

      rasterDatasetID = _.findWhere(this.props.meta, {
        ensemble_member: this.state.run,
        start_date: this.state.start_date,
        end_date: this.state.end_date,
        timescale: timeindex.timescale      
      }).unique_id;
      
      if(this.hasValidData("comparand")) {
        var isolineDataset = _.findWhere(this.props.comparandMeta, {
          ensemble_member: this.state.run,
          start_date: this.state.start_date,
          end_date: this.state.end_date,
          timescale: timeindex.timescale      
        });

        //isolineDataset may not exist if generating a map for a
        //single-variable portal
        isolineDatasetID = isolineDataset ? isolineDataset.unique_id : undefined;
      }
    }    

    var map, mapFooter;
    if (this.state.variableTimes || this.state.comparandTimes) {
      map = (
        <CanadaMap
          rasterLogscale={this.state.rasterLogscale}
          rasterPalette={this.state.rasterPalette}
          rasterDataset={rasterDatasetID}
          rasterVariable={this.state.variable}
          isolineLogscale={this.state.isolineLogscale}
          isolinePalette={this.state.isolinePalette}
          isolineDataset={isolineDatasetID}
          isolineVariable={this.state.comparand}
          numberOfContours={this.state.numberOfContours}
          time={this.state.variableWmsTime}
          rasterTime={this.state.variableWmsTime}
          isolineTime={this.state.comparandWmsTime}
          onSetArea={this.handleSetArea}
          area={this.state.area}
          updateMinmax={this.updateLayerMinmax}
        />
      );
      mapFooter = this.makeMapFooter();

    } else {
      map = <Loader />;
      mapFooter = "";
    }

    rasterControls = (
        <Col lg={6}>
          {rasterTimeSelector}
          {rasterPaletteSelector}
          {rasterScaleSelector}
        </Col>
        );

    if(this.hasValidData("comparand")) {
      isolineControls = (
          <Col lg={6}>
            {isolineTimeSelector}
            {isolinePaletteSelector}
            {isolineScaleSelector}
          </Col>
      );
    }

    return (
      <div>
        <Row>
          <Col lg={12}>
            <div className={styles.map}>

              {map}

              <div className={styles.controls}>
                <ButtonGroup vertical>
                  <Button onClick={this.open} title='Map Settings'><Glyphicon glyph='menu-hamburger' /></Button>
                  <GeoExporter.Modal area={this.state.area} title='Export polygon' />
                  <GeoLoader onLoadArea={this.handleSetArea} title='Import polygon' />
                </ButtonGroup>
              </div>
              <div className={styles.footer}>
                {mapFooter}
              </div>
            </div>
          </Col>
        </Row>

        <Modal show={this.state.showModal} onHide={this.close} >

          <Modal.Header closeButton>
            <Modal.Title>Map Settings</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              {datasetSelector}
            </Row>
            <Row>
             {rasterControls}
             {isolineControls}
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>

        </Modal>

      </div>
    );
  },
});

export default MapController;
