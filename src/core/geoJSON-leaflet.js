import { GeoJSON } from 'leaflet';

export function geoJSONToLeafletLayers(geoJSON) {
  // Returns an *array* of Leaflet `Layer`s
  // that represent the GeoJSON object passed in.
  //
  // Leaflet's function `GeoJSON.geometryToLayer`, which is at the core of
  // this function, has the following shortcomings:
  //
  //  (a) handles only GeoJSON `Feature`s, and not `FeatureCollection`s, and
  //  (b) may return a Leaflet FeatureGroup in the case of GeoJSON `MultiPoint`s
  //      and `GeometryCollection`s
  //
  // We handle (a) by returning an array of layers, one for each Feature in a
  // FeatureCollection, and an array of one item for a single Feature.
  //
  // We handle (b) by ignoring it for the moment, since it is unlikely to arise
  // and in any case ought to be handled OK by Leaflet (since `FeatureGroup` is
  // a subclass of `Layer`).
  switch (geoJSON && geoJSON.type) {
    case 'Feature':
      console.log('geoJSONToLeafletLayers: Feature');
      return [GeoJSON.geometryToLayer(geoJSON)];
    case 'FeatureCollection':
      console.log('geoJSONToLeafletLayers: FeatureCollection');
      return geoJSON.features.map(GeoJSON.geometryToLayer);
    default:
      throw new Error('Invalid GeoJSON object');
  }
}
