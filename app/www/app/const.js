/**
 * Misc. constants
 */

import { draw_circle, draw_cross, draw_square, draw_dot } from "./shapes.js";

/**
 * List of columns on the wishlist, including the string that is shown to the
 * user on the table header
 */
export const watchlist_columns = [
    { name: "name", string: "Name" },
    { name: "mag", string: "Mag" },
    { name: "type", string: "Type" },
    { name: "ra-dec", string: "RA/DEC" },
    { name: "alt-az", string: "ALT/AZ" },
    { name: "style", string: "Style" },
    { name: "controls", string: "Controls" },
    { name: "notes", string: "Notes" },
];

/**
 * List of columns on the wishlist, including the string that is shown to the
 * user on the table header
 */
export const catalog_columns = [
    { name: "name", string: "Name" },
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
        draw: draw_circle,
        color: "#FF0000"
    },
    {
        name: "cross",
        string: "Cross",
        aladin_shape: "cross",
        aladin_name: "Watchlist-cross",
        draw: draw_cross,
        color: "#FF0000"
    },
    {
        name: "square",
        string: "Square",
        aladin_shape: "square",
        aladin_name: "Watchlist-square",
        draw: draw_square,
        color: "#FF0000"
    },
    {
        name: "dot",
        string: "Dot",
        aladin_shape: "circle",
        aladin_name: "Watchlist-dot",
        draw: draw_dot,
        color: "#555555"
    },
];
