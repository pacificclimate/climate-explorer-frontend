const meta = [
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
];

const watershed_wkt = "POINT(-119.15625+53.09375)";

const times = {
  '{"timescale":"yearly","timeidx":"0"}': "1977-07-02T00:00:00Z",
  '{"timescale":"monthly","timeidx":"0"}': "1977-01-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"1"}': "1977-02-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"2"}': "1977-03-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"3"}': "1977-04-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"4"}': "1977-05-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"5"}': "1977-06-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"6"}': "1977-07-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"7"}': "1977-08-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"8"}': "1977-09-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"9"}': "1977-10-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"10"}': "1977-11-15T00:00:00Z",
  '{"timescale":"monthly","timeidx":"11"}': "1977-12-15T00:00:00Z",
  '{"timescale":"seasonal","timeidx":"0"}': "1977-01-16T00:00:00Z",
  '{"timescale":"seasonal","timeidx":"1"}': "1977-04-16T00:00:00Z",
  '{"timescale":"seasonal","timeidx":"2"}': "1977-07-16T00:00:00Z",
  '{"timescale":"seasonal","timeidx":"3"}': "1977-10-16T00:00:00Z",
};

export { meta, times };
