export function getStats() {
    return Promise.resolve({
        data: {
            "foo": {
                "min": 0.06095475000006445,
                "max": 6.054699770000013,
                "mean": 0.876857034992912,
                "median": 0.6346940900000391,
                "stdev": 0.7662424479419461,
                "ncells": 255344,
                "units": "kg m-2 d-1",
                "time": "1977-06-30T12:00:00Z",
                "modtime": "2019-04-09T20:12:51Z"
            },
            "bar": {
                "min": 0.012125870000033956,
                "max": 6.298844170000052,
                "mean": 0.8649415808603693,
                "median": 0.6224868700000457,
                "stdev": 0.7288411910673507,
                "ncells": 255344,
                "units": "kg m-2 d-1",
                "time": "1986-06-30T12:00:00Z",
                "modtime": "2019-04-09T20:12:51Z"
            },
        }
    });
}

// doesn't return valid boundary or hypsometric data, add them if you need to test 
// those things.
export function getWatershed() {
        return Promise.resolve({
            "elevation": {"units": "m", "minimum": 978.0, "maximum": 3929.0}, 
            "area": {"units": "m^2", "value": 29003360.546692643}, 
            "hypsometric_curve": {
                "elevation_bin_start": 0, 
                "elevation_bin_width": 100, 
                "elevation_num_bins": 46, 
                "cumulative_areas": [0], 
                "elevation_units": "m", 
                "area_units": "m^2"
            }, 
            "melton_ratio": {"units": "km/km", "value": 0.5479551951040129}, 
            "boundary": {
                "type": "Feature", 
                "geometry": {"type": "Polygon", "coordinates": []}, 
                "properties": {"mouth": {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-119.15625, 53.09375]}}}
            }
        });
}