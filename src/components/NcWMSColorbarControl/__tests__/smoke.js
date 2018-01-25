import React from 'react';
import ReactDOM from 'react-dom';
import { Map } from 'react-leaflet';
import NcWMSColorbarControl from '../';

it('renders without crashing', () => {
    const div = document.createElement('div');
    div.style.height = 100;
    ReactDOM.render(
        <Map>
            <NcWMSColorbarControl position='topright'>Test</NcWMSColorbarControl>
        </Map>,
        div
    );
});
