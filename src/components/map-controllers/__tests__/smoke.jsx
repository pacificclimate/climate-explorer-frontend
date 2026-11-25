import { meta } from "../../../test_support/data";
import React from "react";
import { render } from "../../../test_support/render";
import DualMapController from "../DualMapController/DualMapController.jsx";
import SingleMapController from "../SingleMapController/SingleMapController.jsx";
import PrecipMapController from "../PrecipMapController/PrecipMapController.jsx";
import { noop } from "lodash";

/*********************************************************************
 * DualMapController smoke tests
 *********************************************************************/
describe("DualMapController", () => {
  describe("with single variable (meta only)", () => {
    describe("with empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        render(
          <DualMapController variable_id="" meta={[]} onSetArea={noop} />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        render(
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
        render(
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
        render(
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
        render(
          <SingleMapController variable_id="" meta={[]} onSetArea={noop} />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        render(
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
        render(
          <PrecipMapController variable_id="" meta={[]} onSetArea={noop} />,
          div,
        );
      });
    });
    describe("with non-empty metadata", () => {
      it("renders without crashing", () => {
        const div = document.createElement("div");
        render(
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
        render(
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
        render(
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

it.each([
  ["single", SingleMapController],
  ["dual", DualMapController],
  ["precipitation", PrecipMapController],
])(
  "%s requests an appearance reset for variable changes but not model changes",
  (_name, Controller) => {
    // Keep metadata requests outside this lifecycle regression.
    const loadMap = vi
      .spyOn(Controller.prototype, "loadMap")
      .mockImplementation(() => {});
    try {
      const view = (model_id, variable_id, metadata = meta) => (
        <Controller
          {...{ model_id, variable_id }}
          meta={metadata}
          pointSelect={false}
          onSetArea={noop}
        />
      );
      const container = render(view("model-a", undefined, []));
      render(view("model-a", "tasmax"), container);
      expect(loadMap.mock.lastCall[2]).toBe(true);
      render(view("model-b", "tasmax"), container);
      expect(loadMap.mock.lastCall[2]).toBe(false);
      render(view("model-b", "pr"), container);
      expect(loadMap.mock.lastCall[2]).toBe(true);
      expect(loadMap).toHaveBeenCalledTimes(3);
    } finally {
      loadMap.mockRestore();
    }
  },
);
