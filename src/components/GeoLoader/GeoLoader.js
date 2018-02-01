import compAcontrolsB from '../../HOCs/compAcontrolsB';
import GeoLoaderButton from './GeoLoaderButton';
import GeoLoaderDialogWithError from './GeoLoaderDialogWithError';

export default compAcontrolsB(GeoLoaderButton, GeoLoaderDialogWithError, 'div', 'GeoLoader');
