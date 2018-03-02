import React from 'react';
import ReactDOM from 'react-dom';
import DualMapController from '../DualMapController';
import SingleMapController from '../SingleMapController';
import PrecipMapController from '../PrecipMapController';


/*********************************************************************
 * DualMapController smoke tests
 *********************************************************************/
describe('DualMapController', () => {
  describe('with single variable (meta only)', () => {
    describe('with empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <DualMapController
            meta={[]}
          />,
          div
        );
      });
    });
    describe('with non-empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <DualMapController
            meta={[
              {
                unique_id: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
                variable_id: 'tasmax',
                start_date: '1961',
                end_date: '1990',
                variable_name: 'Daily Maximum Near-Surface Air Temperature',
                institution: 'PCIC',
                model_id: 'GFDL-ESM2G',
                model_name: null,
                experiment: 'historical,rcp26',
                ensemble_member: 'r1i1p1',
                timescale: 'yearly',
                multi_year_mean: true
              },
            ]}
          />,
          div
        );
      });
    });
  });

  describe('with two variables (meta and comparandMeta)', () => {
    describe('with empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <DualMapController
            meta={[]}
            comparandMeta={[]}
          />,
          div
        );
      });
    });
    describe('with non-empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <DualMapController
            meta={[
              {
                unique_id: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
                variable_id: 'tasmax',
                start_date: '1961',
                end_date: '1990',
                variable_name: 'Daily Maximum Near-Surface Air Temperature',
                institution: 'PCIC',
                model_id: 'GFDL-ESM2G',
                model_name: null,
                experiment: 'historical,rcp26',
                ensemble_member: 'r1i1p1',
                timescale: 'yearly',
                multi_year_mean: true,
              },
            ]}
            comparandMeta={[
              {
                unique_id: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
                variable_id: 'tasmax',
                start_date: '1961',
                end_date: '1990',
                variable_name: 'Daily Maximum Near-Surface Air Temperature',
                institution: 'PCIC',
                model_id: 'GFDL-ESM2G',
                model_name: null,
                experiment: 'historical,rcp26',
                ensemble_member: 'r1i1p1',
                timescale: 'yearly',
                multi_year_mean: true,
              },
            ]}
          />,
          div
        );
      });
    });
  });
});

/*****************************************************************************
 * SingleMapController smoke tests
 *****************************************************************************/
describe('SingleMapController', () => {
  describe('with single variable (meta only)', () => {
    describe('with empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <SingleMapController
            meta={[]}
          />,
          div
        );
      });
    });
    describe('with non-empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <SingleMapController
            meta={[
              {
                unique_id: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
                variable_id: 'tasmax',
                start_date: '1961',
                end_date: '1990',
                variable_name: 'Daily Maximum Near-Surface Air Temperature',
                institution: 'PCIC',
                model_id: 'GFDL-ESM2G',
                model_name: null,
                experiment: 'historical,rcp26',
                ensemble_member: 'r1i1p1',
                timescale: 'yearly',
                multi_year_mean: true
              },
            ]}
          />,
          div
        );
      });
    });
  });
});

/*********************************************************************
 * PrecipMapController smoke tests
 *********************************************************************/
describe('PrecipMapController', () => {
  describe('with single variable (meta only)', () => {
    describe('with empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <PrecipMapController
            meta={[]}
          />,
          div
        );
      });
    });
    describe('with non-empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <PrecipMapController
            meta={[
              {
                unique_id: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
                variable_id: 'tasmax',
                start_date: '1961',
                end_date: '1990',
                variable_name: 'Daily Maximum Near-Surface Air Temperature',
                institution: 'PCIC',
                model_id: 'GFDL-ESM2G',
                model_name: null,
                experiment: 'historical,rcp26',
                ensemble_member: 'r1i1p1',
                timescale: 'yearly',
                multi_year_mean: true
              },
            ]}
          />,
          div
        );
      });
    });
  });

  describe('with two variables (meta and comparandMeta)', () => {
    describe('with empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <PrecipMapController
            meta={[]}
            comparandMeta={[]}
          />,
          div
        );
      });
    });
    describe('with non-empty metadata', () => {
      it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <PrecipMapController
            meta={[
              {
                unique_id: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
                variable_id: 'tasmax',
                start_date: '1961',
                end_date: '1990',
                variable_name: 'Daily Maximum Near-Surface Air Temperature',
                institution: 'PCIC',
                model_id: 'GFDL-ESM2G',
                model_name: null,
                experiment: 'historical,rcp26',
                ensemble_member: 'r1i1p1',
                timescale: 'yearly',
                multi_year_mean: true,
              },
            ]}
            comparandMeta={[
              {
                unique_id: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
                variable_id: 'tasmax',
                start_date: '1961',
                end_date: '1990',
                variable_name: 'Daily Maximum Near-Surface Air Temperature',
                institution: 'PCIC',
                model_id: 'GFDL-ESM2G',
                model_name: null,
                experiment: 'historical,rcp26',
                ensemble_member: 'r1i1p1',
                timescale: 'yearly',
                multi_year_mean: true,
              },
            ]}
          />,
          div
        );
      });
    });
  });
});