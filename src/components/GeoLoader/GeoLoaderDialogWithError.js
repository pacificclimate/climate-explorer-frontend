import compAcontrolsB from '../../HOCs/compAcontrolsB';
import GeoLoaderMainDialog from './GeoLoaderMainDialog';
import GeoLoaderErrorDialog from './GeoLoaderErrorDialog';

export default compAcontrolsB(GeoLoaderMainDialog, GeoLoaderErrorDialog, 'div', 'GeoLoaderDialogWithError');
