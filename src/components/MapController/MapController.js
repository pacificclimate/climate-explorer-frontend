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
 * CanadaMap for a scalar colour map; a second set of metadata (comparand) will 
 * be additionally passed as isolines / contours.
 * 
 * Also responsible for passing an area input by the user by drawing on the map
 * up to the AppController, to allow data for graphs to be calculated over
 * a specific area.
 *******************************************************************************/

import React from 'react';
import { Row, Col, Button, ButtonGroup, Glyphicon, Modal } from 'react-bootstrap';
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
import { timestampToTimeOfYear} from '../../core/util'; 

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
      scalarLogscale: false,
      numberOfContours: 10,
      contourLogscale: false,
    };
  },
  
  //this function handles user selection of all the straightforward
  //parameters like logscale or palette.
  updateSelection: function (param, selection) {
    var update = {}; update[param] = selection;
    this.setState(update);
  },

  //this function updates the timestamp displayed on the map and triggers 
  //a rerender.
  //timeidx is a stringified object with a resolution
  //(monthly, annual, seasonal) and an index (0-11). For example
  //{timeres: monthly, timeidx: 3} would represent April. 
  //It's stringified because Selector won't pass an object.
  updateTime: function (timeidx) {
    this.setState({
      timeidx: timeidx,
      wmstime: this.state.times[timeidx],
    });
  },

  //this function stores a dataset selected by the user to state, 
  //triggering a rerender to show the new dataset.
  //a "dataset" in this case is not a specific file. It is a
  //variable + emissions + model + period + run combination. Timestamps for
  //a "dataset" may be spread across up to three files (one annual, one 
  //seasonal, one monthly). MapController stores the parameters of the dataset
  //in state, but doesn't select (or store in state) a specific file with a 
  //specific unique_id until rendering, when it needs to pass an exact file
  //and timestamp to the viewer component CanadaMap.
  updateDataset: function (dataset) {
    dataset = JSON.parse(dataset);
    var run = dataset.ensemble_member;
    var start_date = dataset.start_date;
    var end_date = dataset.end_date;
    
    //generate the list of available times for this variable+run+period
    //which may include multiple files of different time resolutions 
    //(annual, seasonal, or monthly).
    var times = {};
    var timesPromises = [];
        
    var datasets = _.filter(this.props.meta, 
        {"ensemble_member": run, "start_date": start_date, "end_date": end_date });
    
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
          times[idxString] = responses[i].data[id].times[timeidx];
        }
      }
      //select an arbitrary index to display initially. It will be a
      //0th index, but could be January, winter, or Annual.
      var startingIndex = Object.keys(times)[0];

      this.setState({
        run: run,
        start_date: start_date,
        end_date: end_date,
        times: times,
        timeidx: startingIndex, 
        wmstime: times[startingIndex],
      });
    });
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

  componentWillReceiveProps: function (nextProps) {
    var defaultDataset = nextProps.meta[0];
    var run = defaultDataset.ensemble_member;
    var start_date = defaultDataset.start_date;
    var end_date = defaultDataset.end_date;
    
    var times = {};
    var timesPromises = [];
    
    //set colours. In order of preference:
    //1. colours received by prop
    //2. colours set by the user or this function previously and held in state
    //3. defaults (scalar rainbow if a single dataset, 
    //             scalar greyscale and contours rainbow for 2)
    var sPalette, cPalette;
    if(nextProps.scalarPalette) {
      sPalette = nextProps.scalarPalette;
      cPalette = nextProps.contourPalette;
    }
    else if(this.state.scalarPalette) {
      sPalette = this.state.scalarPalette;
      cPalette = this.state.contourPalette;
    }
    else {
      sPalette = nextProps.comparandMeta ? 'seq-Greys' : 'x-Occam';
      cPalette = nextProps.comparandMeta ? 'x-Occam': undefined;
    }
   
    //generate a list of timestamps available for the specified data
    //by querying the metadata API.
    var datasets = _.filter(nextProps.meta, 
        {"ensemble_member": run, "start_date": start_date, "end_date": end_date });
    
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
          times[idxString] = responses[i].data[id].times[timeidx];
        }
      }

      //select a starting timestamp to display.
      //should correspond to a 0th index, but might be annual, seasonal, or monthly
      var startingTime = Object.keys(times)[0];
      
      //store values and render
      this.setState({
        run: run,
        start_date: start_date,
        end_date: end_date,
        times: times,
        timeidx: startingTime, 
        wmstime: times[startingTime],
        variable: nextProps.meta[0].variable_id,
        comparand: nextProps.comparandMeta ? nextProps.comparandMeta[0].variable_id: undefined,
        scalarPalette: sPalette,
        contourPalette: cPalette
      });
    });    
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before we have required data
    return !_.isEqual(nextState, this.state);
  },

  //renders a CanadaMap, menu buttons, and a dialog box with a lot of view options
  render: function () {          
    //populate UI selectors: palette and scale for both isolines and blocks,
    //run and period dropdown, time of year selector, number of isolines
    
    //colour selector
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
    
    //logscale selectors
    var colorScales = [['false', 'Linear'], ['true', 'Logarithmic']];

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
        items={ids} value={`${this.state.run} ${this.state.start_date}-${this.state.end_date}`}
        value={selectedDataset}
      />);
    }

    var timeOptions = _.map(this.state.times, function (v, k) {
      return [k, timestampToTimeOfYear(v)];
    });
 
    //configuration options for the second dataset, if it exists
    var contourPaletteSelector, contourScaleSelector, numContoursSelector;
    if(this.props.comparandMeta) {
      contourPaletteSelector = (            
        <Selector
          label={"Isoline Colour Palette"}
          onChange={this.updateSelection.bind(this, 'contourPalette')}
          items={palettes}
          value={this.state.contourPalette}
        />
      );
      //TODO: 
      contourScaleSelector = (
        <Selector
          label={"Isoline Color scale"}
          onChange={this.updateSelection.bind(this, 'contourLogscale')}
          items={colorScales}
          value={this.state.contourLogscale}
        />
      );
      numContoursSelector = (
        <Selector
          label={"Number of Isolines"}
          onChange={this.updateSelection.bind(this, 'numberOfContours')}
          items={[4, 6, 8, 10, 12]}
          value={this.state.numberOfContours}
        />
      );
    }
   
    //generate the map
    //determine which files (annual, seasonal, monthly?) 
    //actually contain the requested timestamps.
    var scalarDatasetID;
    var contourDatasetID;

    if(this.state.timeidx) {
      var timeindex = JSON.parse(this.state.timeidx);
      
      scalarDatasetID = _.findWhere(this.props.meta, {
        ensemble_member: this.state.run,
        start_date: this.state.start_date,
        end_date: this.state.end_date,
        timescale: timeindex.timescale      
      }).unique_id;
    
      if(this.props.comparandMeta) {
        contourDatasetID = _.findWhere(this.props.comparandMeta, {
          ensemble_member: this.state.run,
          start_date: this.state.start_date,
          end_date: this.state.end_date,
          timescale: timeindex.timescale      
        }).unique_id;
      }
    }    

    var map, mapFooter;
    if (this.state.times) {
      map = (
        <CanadaMap
          scalarLogscale={this.state.scalarLogscale}
          scalarPalette={this.state.scalarPalette}
          scalarDataset={scalarDatasetID}
          scalarVariable={this.state.variable}
          contourLogscale={this.state.contourLogscale}
          contourPalette={this.state.contourPalette}
          contourDataset={contourDatasetID}
          contourVariable={this.state.comparand}
          numberOfContours={this.state.numberOfContours}
          time={this.state.wmstime}
          onSetArea={this.handleSetArea}
          area={this.state.area}
        />
      );

      mapFooter = (
        <h5>
          Dataset: {this.state.start_date}-{this.state.end_date} &nbsp;
          {timestampToTimeOfYear(this.state.wmstime)} {this.state.run} 
        </h5>
          );

    } else {
      map = <Loader />;
      mapFooter = "";
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
            { datasetSelector }
            <Selector
              label={"Time of Year"}
              onChange={this.updateTime}
              items={timeOptions}
              value={this.state.timeidx}
            />
            <Selector
              label={"Block Colour Palette"}
              onChange={this.updateSelection.bind(this, 'scalarPalette')}
              items={palettes}
              value={this.state.scalarPalette}
            />
            {contourPaletteSelector}

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
