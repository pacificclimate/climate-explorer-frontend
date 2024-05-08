import React from "react";
import ReactDOM from "react-dom";
import DualMapController from "../DualMapController";
import SingleMapController from "../SingleMapController";
import PrecipMapController from "../PrecipMapController";
import { noop } from "lodash";

/*********************************************************************
 * DualMapController smoke tests
 *********************************************************************/
describe("DualMapController", () => {
  describe("with single variable (meta only)", () => {
    describe("with empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <DualMapController variable_id="" meta={[]} onSetArea={noop} />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <DualMapController
            variable_id="tasmax"
            meta={[
              {
                unique_id:
                  "tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada",
                variable_id: "tasmax",
                start_date: "1961",
                end_date: "1990",
                variable_name: "Daily Maximum Near-Surface Air Temperature",
                institution: "PCIC",
                model_id: "GFDL-ESM2G",
                model_name: null,
                experiment: "historical,rcp26",
                ensemble_member: "r1i1p1",
                timescale: "yearly",
                multi_year_mean: true,
              },
            ]}
            onSetArea={noop}
          />,
          div,
        );
      });
    });
  });

  describe("with two variables (meta and comparandMeta)", () => {
    describe("with empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <DualMapController
            variable_id=""
            meta={[]}
            comparand_id=""
            comparandMeta={[]}
            onSetArea={noop}
          />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <DualMapController
            variable_id="tasmax"
            meta={[
              {
                unique_id:
                  "tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada",
                variable_id: "tasmax",
                start_date: "1961",
                end_date: "1990",
                variable_name: "Daily Maximum Near-Surface Air Temperature",
                institution: "PCIC",
                model_id: "GFDL-ESM2G",
                model_name: null,
                experiment: "historical,rcp26",
                ensemble_member: "r1i1p1",
                timescale: "yearly",
                multi_year_mean: true,
              },
            ]}
            comparand_id="tasmax"
            comparandMeta={[
              {
                unique_id:
                  "tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada",
                variable_id: "tasmax",
                start_date: "1961",
                end_date: "1990",
                variable_name: "Daily Maximum Near-Surface Air Temperature",
                institution: "PCIC",
                model_id: "GFDL-ESM2G",
                model_name: null,
                experiment: "historical,rcp26",
                ensemble_member: "r1i1p1",
                timescale: "yearly",
                multi_year_mean: true,
              },
            ]}
            onSetArea={noop}
          />,
          div,
        );
      });
    });
  });
});

/*****************************************************************************
 * SingleMapController smoke tests
 *****************************************************************************/
describe("SingleMapController", () => {
  describe("with single variable (meta only)", () => {
    describe("with empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <SingleMapController variable_id="" meta={[]} onSetArea={noop} />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <SingleMapController
            variable_id="tasmax"
            meta={[
              {
                unique_id:
                  "tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada",
                variable_id: "tasmax",
                start_date: "1961",
                end_date: "1990",
                variable_name: "Daily Maximum Near-Surface Air Temperature",
                institution: "PCIC",
                model_id: "GFDL-ESM2G",
                model_name: null,
                experiment: "historical,rcp26",
                ensemble_member: "r1i1p1",
                timescale: "yearly",
                multi_year_mean: true,
              },
            ]}
            onSetArea={noop}
          />,
          div,
        );
      });
    });
  });
});

/*********************************************************************
 * PrecipMapController smoke tests
 *********************************************************************/
describe("PrecipMapController", () => {
  describe("with single variable (meta only)", () => {
    describe("with empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <PrecipMapController variable_id="" meta={[]} onSetArea={noop} />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <PrecipMapController
            variable_id="tasmax"
            meta={[
              {
                unique_id:
                  "tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada",
                variable_id: "tasmax",
                start_date: "1961",
                end_date: "1990",
                variable_name: "Daily Maximum Near-Surface Air Temperature",
                institution: "PCIC",
                model_id: "GFDL-ESM2G",
                model_name: null,
                experiment: "historical,rcp26",
                ensemble_member: "r1i1p1",
                timescale: "yearly",
                multi_year_mean: true,
              },
            ]}
            onSetArea={noop}
          />,
          div,
        );
      });
    });
  });

  describe("with two variables (meta and comparandMeta)", () => {
    describe("with empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <PrecipMapController
            variable_id=""
            meta={[]}
            comparand_id=""
            comparandMeta={[]}
            onSetArea={noop}
          />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(
          <PrecipMapController
            variable_id="tasmax"
            meta={[
              {
                unique_id:
                  "tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada",
                variable_id: "tasmax",
                start_date: "1961",
                end_date: "1990",
                variable_name: "Daily Maximum Near-Surface Air Temperature",
                institution: "PCIC",
                model_id: "GFDL-ESM2G",
                model_name: null,
                experiment: "historical,rcp26",
                ensemble_member: "r1i1p1",
                timescale: "yearly",
                multi_year_mean: true,
              },
            ]}
            comparand_id="tasmax"
            comparandMeta={[
              {
                unique_id:
                  "tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada",
                variable_id: "tasmax",
                start_date: "1961",
                end_date: "1990",
                variable_name: "Daily Maximum Near-Surface Air Temperature",
                institution: "PCIC",
                model_id: "GFDL-ESM2G",
                model_name: null,
                experiment: "historical,rcp26",
                ensemble_member: "r1i1p1",
                timescale: "yearly",
                multi_year_mean: true,
              },
            ]}
            onSetArea={noop}
          />,
          div,
        );
      });
    });
  });
});
