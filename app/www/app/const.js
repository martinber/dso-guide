/**
 * Misc. constants
 */

/**
 * List of rows on the wishlist, including the string that is shown to the user
 * on the table header
 */
export const watchlist_rows = [
    { name: "name", string: "Name" },
    { name: "id", string: "ID" },
    { name: "mag", string: "Mag" },
    { name: "type", string: "Type" },
    { name: "ra-dec", string: "RA/DEC" },
    { name: "alt-az", string: "ALT/AZ" },
    { name: "style", string: "Style" },
    { name: "controls", string: "Controls" },
    { name: "notes", string: "Notes" },
];

/**
 * List of rows on the wishlist, including the string that is shown to the user
 * on the table header
 */
export const catalog_rows = [
    { name: "name", string: "Name" },
    { name: "id", string: "ID" },
    { name: "mag", string: "Mag" },
    { name: "type", string: "Type" },
    { name: "ra-dec", string: "RA/DEC" },
    { name: "alt-az", string: "ALT/AZ" },
    { name: "controls", string: "Controls" },
    { name: "appears_on", string: "Appears on" },
];

/**
 * Available styles for object highlighting. Each one has an integer ID
 * represented by the index on this table.
 */
export const object_styles = [
    {
        name: "circle",
        string: "Circle",
        aladin_shape: "circle",
        aladin_name: "Watchlist-circle",
        color: "#FF0000"
    },
    {
        name: "cross",
        string: "Cross",
        aladin_shape: "cross",
        aladin_name: "Watchlist-cross",
        color: "#00FF00"
    },
    {
        name: "square",
        string: "Square",
        aladin_shape: "square",
        aladin_name: "Watchlist-square",
        color: "#0000FF"
    },
    {
        name: "dot",
        string: "Dot",
        aladin_shape: "circle",
        aladin_name: "Watchlist-dot",
        color: "#555555"
    },
];

