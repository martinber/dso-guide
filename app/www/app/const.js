/**
 * Misc. constants
 */

import { draw_circle, draw_cross, draw_square, draw_dot } from "./shapes.js";

/**
 * Available styles for object highlighting. Each one has an integer ID
 * represented by the index on this table.
 */
export const object_styles = [
    {
        id: 0,
        name: "circle",
        string: "Circle",
        aladin_name: "Circle",
        class_string: "watchlist-0",
        draw: draw_circle,
        color: "#FF0000"
    },
    {
        id: 1,
        name: "cross",
        string: "Cross",
        aladin_name: "Cross",
        class_string: "watchlist-1",
        draw: draw_cross,
        color: "#FF0000"
    },
    {
        id: 2,
        name: "square",
        string: "Square",
        aladin_name: "Square",
        class_string: "watchlist-2",
        draw: draw_square,
        color: "#FF0000"
    },
    {
        id: 3,
        name: "dot",
        string: "Dot",
        aladin_name: "Dot",
        class_string: "watchlist-3",
        draw: draw_dot,
        color: "#FF0000"
    },
];
