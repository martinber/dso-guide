/**
 * DSO json data related functions
 */

/**
 * Find id of object given his data id
 */
export function get_id(dsos_data, data_id) {
    for (var i = 0; i < dsos_data.features.length; i++)
    {
        if (dsos_data.features[i].id == data_id)
        {
            return i;
        }
    }
    return 0; // TODO
}

/**
 * Get name of object
 */
export function get_name(dsos_data, id) {
    return dsos_data.features[id].properties.name;
}

/**
 * Get type of object
 * // TODO
 */
export function get_type(dsos_data, id) {
    return dsos_data.features[id].properties.type;
}

/**
 * Get magnitude of object
 */
export function get_mag(dsos_data, id) {
    // TODO
    return dsos_data.features[id].properties.mag;
}

/**
 * Get dimensions of object
 *
 * Returns a list of two floats, e.g.: [0.5, 4]
 */
export function get_dimensions(dsos_data, id) {
    var values = dsos_data.features[id].properties.dim.split("x");

    var result;
    if (values.length == 2) {
        var result = [parseFloat(values[0]), parseFloat(values[1])];
    } else if (values.length == 1) {
        var result = [parseFloat(values[0]), parseFloat(values[0])];
    }

    if (isNaN(result[0]) || isNaN(result[1])) {
        var string = dsos_data.features[id].properties.dim;
        console.error(`Failed to parse dimensions: ${string}`);
    }
    return result;
}

/**
 * Get right ascention of object
 */
export function get_ra(dsos_data, id) {
    return dsos_data.features[id].geometry.coordinates[0];
}

/**
 * Get declination of object
 */
export function get_dec(dsos_data, id) {
    return dsos_data.features[id].geometry.coordinates[1];
}

/**
 * Get altitude of object
 */
export function get_alt(dsos_data, id) {
    return "TODO";
}

/**
 * Get azimuth of object
 */
export function get_az(dsos_data, id) {
    return "TODO";
}
