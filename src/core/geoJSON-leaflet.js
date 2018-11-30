import { GeoJSON } from 'leaflet';

export function geoJSONToLeafletLayers(geoJSON) {
  // Returns an *array* of Leaflet `Layer`s
  // that represent the GeoJSON object passed in.
  //
  // Leaflet's function `GeoJSON.geometryToLayer`, which is at the core of
  // this function, has the following shortcomings:
  //
  //  (a) handles only GeoJSON `Feature`s, and not `FeatureCollection`s, and
  //  (b) errors out with `GeometryCollection`s
  //  (c) may return a Leaflet FeatureGroup in the case of GeoJSON `MultiPoint`s
  //
  // We handle (a) by returning an array of layers, one for each Feature in a
  // FeatureCollection, and an array of one item for a single Feature.
  //
  // We handle (b) similarly to (a).
  //
  // We handle (c) by ignoring it for the moment, since it is unlikely to arise
  // and in any case ought to be handled OK by Leaflet (since `FeatureGroup` is
  // a subclass of `Layer`).

  console.log('geoJSONToLeafletLayers geoJSON =', geoJSON);

  const geoJSONType = geoJSON && geoJSON.type;
  switch (geoJSONType) {
    case undefined:
      // This isn't strictly valid GeoJSON, but there's no need to be
      // *prissy* about it.
      return [];
    case 'Feature':
      if (geoJSON.geometry.type === 'GeometryCollection') {
        return geoJSON.geometry.geometries.map(GeoJSON.geometryToLayer);
      }
      return [GeoJSON.geometryToLayer(geoJSON)];
    case 'FeatureCollection':
      return geoJSON.features.map(GeoJSON.geometryToLayer);
    default:
      throw new Error(`Invalid GeoJSON object type '${geoJSONType}'`);
  }
}

const geoJSONProperties = { source: 'PCIC Climate Explorer' };

export function layersToGeoJSON(collectionType, layers) {
  // Convert an array of Leaflet layers to GeoJSON according to
  // argument `collectionType`:
  //
  //  - `'FeatureCollection'`: a GeoJSON FeatureCollection.
  //    Each layer becomes a Feature.
  //
  //  - `'GeometryCollection'`: a single GeoJSON Feature with
  //    geometry that is a GeometryCollection containing all the
  //    Leaflet layers.
  //
  // In the case of an empty array, return `{}`.
  //
  // In the case of an array with 1 element, return a single GeoJSON Feature.

  if (layers.length === 0) {
    return {};
  }

  if (layers.length === 1) {
    const geoJSON = layers[0].toGeoJSON();
    geoJSON.properties = geoJSONProperties;
    return geoJSON;
  }

  if (collectionType === 'FeatureCollection') {
    return {
      type: 'FeatureCollection',
      properties: geoJSONProperties,
      features: layers.map(layer => layer.toGeoJSON()),
    };
  }

  if (collectionType === 'GeometryCollection') {
    return {
      type: 'Feature',
      properties: geoJSONProperties,
      geometry: {
        type: 'GeometryCollection',
        geometries: layers.map(layer => layer.toGeoJSON().geometry),
      },
    };
  }

  throw new Error(`Invalid GeoJSON collection type: '${collectionType}'`);
}
