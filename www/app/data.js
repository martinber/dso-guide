/**
 * Object data related functions
 */

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
