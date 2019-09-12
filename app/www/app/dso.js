/**
 * Things related to the watchlist or catalog
 */

function Type(short_name) {
    this.short_name = short_name;

    this.long_name = null;
    switch (short_name) {
        case "gg":  this.long_name = "Galaxy cluster"; break;
        case "g":   this.long_name = "Galaxy"; break;
        case "s":   this.long_name = "Spiral galaxy"; break;
        case "s0":  this.long_name = "Lenticular galaxy"; break;
        case "sd":  this.long_name = "Dwarf galaxy"; break;
        case "i":   this.long_name = "Irregular galaxy"; break;
        case "e":   this.long_name = "Elliptical galaxy"; break;
        case "oc":  this.long_name = "Open cluster"; break;
        case "gc":  this.long_name = "Globular cluster"; break;
        case "dn":  this.long_name = "Dark nebula"; break;
        case "bn":  this.long_name = "Bright nebula"; break;
        case "sfr": this.long_name = "Star forming region"; break;
        case "rn":  this.long_name = "Reflection nebula"; break;
        case "pn":  this.long_name = "Planetary nebula"; break;
        case "snr": this.long_name = "Supernova remnant"; break;
        case "en":  this.long_name = "Emmision nebula"; break;
        default:
            console.error(`Unknown DSO type ${short_name}`);
            long_name = "UNKNOWN";
            break;
    }
}

/**
 * Represents a DSO present on the Catalog
 */
export function Dso(dsos_data, id, appears_on) {
    // Equal to the index on the DsoManager.catalog where this object is located
    this.id = id;

    this.data_id = dsos_data.features[id].id; // Original ID from data
    this.name = dsos_data.features[id].properties.name;
    this.coords = dsos_data.features[id].geometry.coordinates;
    this.type = new Type(dsos_data.features[id].properties.type);
    this.mag = dsos_data.features[id].properties.mag;

    this.appears_on = appears_on;

    this.catalog_tr = null; // Reference to JQuery table row

    // Get dimensions
    {
        let values = dsos_data.features[id].properties.dim.split("x");

        let result;
        if (values.length == 2) {
            this.dimensions = [parseFloat(values[0]), parseFloat(values[1])];
        } else if (values.length == 1) {
            this.dimensions = [parseFloat(values[0]), parseFloat(values[0])];
        } else {
            let string = dsos_data.features[id].properties.dim;
            console.error(`Failed to parse dimensions: ${string}`);
        }

        if (isNaN(this.dimensions[0]) || isNaN(this.dimensions[1])) {
            let string = dsos_data.features[id].properties.dim;
            console.error(`Failed to parse dimensions: ${string}`);
        }
    }

    /**
     * Set reference to the JQuery tr where this object is being shown
     */
    this.set_catalog_tr = function(tr) {

        this.catalog_tr = tr;
    }

    /**
     * Get reference to the JQuery tr where this object is being shown
     *
     * Can return null
     */
    this.get_catalog_tr = function() {

        return this.catalog_tr;
    }
}

/**
 * Represents a DSO present on the Watchlist
 */
export function WatchDso(dso, notes, style) {
    this.dso = dso; // Reference to Dso object on the Catalog
    this.notes = notes;
    this.style = notes;

    this.watchlist_tr = null; // Reference to JQuery table row

    /**
     * Set reference to the JQuery tr where this object is being shown
     */
    this.set_watchlist_tr = function(tr) {

        this.watchlist_tr = tr;
    }

    /**
     * Get reference to the JQuery tr where this object is being shown
     *
     * Can return null
     */
    this.get_watchlist_tr = function() {

        return this.watchlist_tr;
    }
}

/**
 * Manages the Watchlist and Catalog
 */
export function DsoManager(dsos_data, catalogs_data) {
    this.catalog = [];
    this.watchlist = [];

    // Create the catalog
    for (let id = 0; id < dsos_data.features.length; id++) {

        // Find in the catalogs list the id and return the appears_on array
        // of the element

        let element = catalogs_data.find(function(e) {
            return e.id == id;
        })

        let appears_on;
        if (typeof element == "undefined") {
            appears_on = [];
        } else {
            appears_on = element.appears_on;
        }

        this.catalog.push(new Dso(dsos_data, id, appears_on));
    }


    /**
     * Add object to watchlist
     *
     * notes and style must be null if the object is being added by the user. If
     * the object is being loaded from the server notes and style should be set.
     *
     * Returns the watch_dso if the object was added succesfully, else returns
     * null
     */
    this.watchlist_add = function(id, notes, style) {

        // Check if the object already exists
        let index = this.watchlist.findIndex((watch_dso) => {
            return watch_dso.dso.id == id;
        });
        if (index > -1) {
            console.error("Element already exists id:", id);
            return null;
        }

        if (notes == null) { notes = "" }
        if (style == null) { style = 0 }

        let watch_dso = new WatchDso(this.catalog[id], notes, style);
        this.watchlist.push(watch_dso);

        return watch_dso;
    }

    /**
     * Remove object from watchlist
     */
    this.watchlist_remove = function(watch_dso) {

        let index = this.watchlist.findIndex(function(e) {
            return watch_dso.dso.id == e.dso.id;
        });
        if (index > -1) {
            this.watchlist.splice(index, 1);
            return;
        } else {
            console.error("Tried to remove unexistent id:", watch_dso.dso.id);
        }

    }
}

