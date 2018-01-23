import React from 'react';
import { WMSTileLayer } from 'react-leaflet';


export default function DataLayer(props) {
  console.log('DataLayer', props);
  const { dataset, onLayerRef, onNoLayer, ...wmsParams } = props;
  if (dataset) {
    return (
      <WMSTileLayer
        url={NCWMS_URL}
        {...wmsParams}
        ref={onLayerRef}
      />
    );
  }
  onNoLayer();
  return null;
}
