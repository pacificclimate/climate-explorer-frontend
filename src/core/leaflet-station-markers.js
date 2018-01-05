/*
 * leaflet-station-markers.js - creates a map layer to show the locations
 * of measurement stations. Uses the global leaflet variable L.
 */

import axios from 'axios';
import urljoin from 'url-join';

/*
 * stationIcon - class that inherits from L.Icon; shared characteristics of icons used 
 * to represent stations.
 */

var StationIcon = L.Icon.extend({
  options: {
    iconSize: [18, 24],
    iconAnchor: [9, 24],
    popupAnchor: [0, 24],
    className: "station-icon"
  }
});

var unselectedIcon = new StationIcon({iconUrl: '../../public/images/hydro_marker_unselected.svg'});
var selectedIcon = new StationIcon({iconUrl: '../../public/images/hydro_marker_selected.svg'});

/*
 * addStationMarkerLayer - asynchronous function that queries the climate
 * explorer backend to learn the locations of hydro stations, creates a
 * leaflet FeatureGroup containing all the stations, and adds that group 
 * to the map object passed in as an argument.
 * 
 * Optionally, a second argument may be passed, a function that will be bound
 * to all stations onClick.
 */

var addStationMarkerLayer = function (map, onClick) {
  
  //send geoJSON representing the marker to registered callback
  var onMarkerClick = function () {
    var markerJSON = this.toGeoJSON();
    markerJSON.properties.name = this.options.title;
    markerJSON.properties.fileId = this.options.fileId;
    markerJSON.properties.station = this.options.id;
    if(this.options.icon == selectedIcon) {
      this.setIcon(unselectedIcon);
      markerJSON.properties.selected = false;
    }
    else {
      this.setIcon(selectedIcon);
      markerJSON.properties.selected = true;
    }
    onClick(markerJSON);
  };
  
  
  //add a station to the map for each available watershed.
  axios({baseURL: urljoin(CE_BACKEND_URL, 'multistation'), 
    params: {
      ensemble_name: CE_ENSEMBLE_NAME
      }
  }).then(response => {
    var stations = {};
    var stationLayer = L.featureGroup();
    var markers = [];
    for(var key in response.data) {
      for(var station in response.data[key].outlets) {
        var stationName = `${response.data[key].watershed} ${station}`;
        var stationLat = response.data[key].outlets[station].latitude;
        var stationLong = response.data[key].outlets[station].longitude;
        stations[stationName] = {latitude: stationLat, longitude: stationLong, id: station, fileId: key};
      }
    }
    for(var station in stations) {
      var marker = L.marker([stations[station].latitude, stations[station].longitude],
          {title: station, icon: unselectedIcon, id:stations[station].id, fileId: stations[station].fileId});
      marker.on('click', onMarkerClick);
      markers.push(marker);
    }
    var stationLayer = L.featureGroup(markers); 
    stationLayer.addTo(map);
  });
};

module.exports = {addStationMarkerLayer};