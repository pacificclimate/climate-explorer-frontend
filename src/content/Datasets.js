// list of datasets, defined with JavaScript object literals
var datasets = [
{"name": "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-GFDL-ESM2G_historical-rcp26_r1i1p1_19500101-21001231"}, 
{"name": "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-HadGEM2-CC_historical-rcp45_r1i1p1_19500101-20991230"},
{"name": "pr-tasmax-tasmin_day_BCCAQ-ANUSPLIN300-CCSM4_historical-rcp45_r2i1p1_19500101-21001231"},
{"name": "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CanESM2_historical-rcp85_r1i1p1_19500101-21001231"},
];

module.exports.datasets = datasets

var metadata = {
	'model_id1':
	{
		'institute_id': '<string>',
		'institution': '<string>',
		'model_id': '<string>',
		'model_name': '<string>',
		'experiment': '<string>',
		'variables': ['<string:var1>', '<string:var2>'],
		'ensemble_member': '<string>'
	},
	'model_id2':
	{
		'institute_id': '<string>',
		'institution': '<string>',
		'model_id': '<string>',
		'model_name': '<string>',
		'experiment': '<string>',
		'variables': ['<string:var1>', '<string:var2>'],
		'ensemble_member': '<string>'
	},
};

module.exports.metadata = metadata
