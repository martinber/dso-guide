/**
 * Things related to the watchlist or catalog
 */

import { catalog as catalogs_data } from "./catalog.js";

function Type(short_name) {
    this.short_name = short_name;

    let long_name = null;
    switch (short_name) {
        case "gg":  long_name = "Galaxy cluster"; break;
        case "g":   long_name = "Galaxy"; break;
        case "s":   long_name = "Spiral galaxy"; break;
        case "s0":  long_name = "Lenticular galaxy"; break;
        case "sd":  long_name = "Dwarf galaxy"; break;
        case "i":   long_name = "Irregular galaxy"; break;
        case "e":   long_name = "Elliptical galaxy"; break;
        case "oc":  long_name = "Open cluster"; break;
        case "gc":  long_name = "Globular cluster"; break;
        case "dn":  long_name = "Dark nebula"; break;
        case "bn":  long_name = "Bright nebula"; break;
        case "sfr": long_name = "Star forming region"; break;
        case "rn":  long_name = "Reflection nebula"; break;
        case "pn":  long_name = "Planetary nebula"; break;
        case "snr": long_name = "Supernova remnant"; break;
        case "en":  long_name = "Emmision nebula"; break;
        default:
            console.error(`Unknown DSO type ${short_name}`);
            long_name = "UNKNOWN";
            break;
    }
}

/**
 * Represents a DSO present on the Catalog
 */
function Dso(dsos_data, id, appears_on) {
    // Equal to the index on the DsoManager.catalog where this object is located
    this.id = id;

    this.tr = null; // Reference to JQuery table row

    this.data_id = dsos_data.features[id].id; // Original ID from data
    this.name = dsos_data.features[id].properties.name;
    this.coords = dsos_data.features[id].geometry.coordinates;
    this.type = new Type(dsos_data.features[id].properties.type);
    this.mag = dsos_data.features[id].properties.mag;
    this.dimensions = dsos_data.features[id].properties.dim;

    this.appears_on = appears_on;
}

/**
 * Represents a DSO present on the Watchlist
 */
function WatchDso(dso, notes, style) {
    this.dso = dso; // Reference to Dso object on the Catalog
    this.notes = notes;
    this.style = notes;
}

/**
 * Manages the Watchlist and Catalog
 */
function DsoManager(dsos_data, catalogs_data) {
    this.catalog = [];
    this.watchlist = [];

    // Create the catalog
    for (let id = 0; id < dsos_data.features.length; i++) {

        // Find in the catalogs list the id and return the appears_on array
        // of the element
        let appears_on = catalogs.find(function(e) {
            return e.id == id;
        }.appears_on;

        this.catalog.push(new Dso(dsos_data, id, appears_on);
    }
}

/**
 * Add object to watchlist
 *
 * notes and style must be null if the object is being added by the user. If the
 * object is being loaded from the server notes and style should be set.
 */
DsoManager.watchlist_add = function(id, notes, style) {

    if (notes == null) { notes = "" }
    if (style == null) { style = 1 }

    this.watchlist.push(
        new WatchDso(this.catalog[id], notes, style)
    );
}

/**
 * Remove object from watchlist
 */
DsoManager.watchlist_remove = function(id) {

    let index = watchlist.findIndex(function(dso) {
        return dso.id == id;
    };

    this.watchlist.splice(index, 1);
}
