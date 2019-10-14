/**
 * Helper functions to manipulate the Aladin and Celestial maps
 */

import { object_styles } from "./const.js";
import { celestial_config } from "./config.js";
import { eq_to_geo } from "./tools.js";

/**
 * Returns true if the aladin banner is visible
 */
export function aladin_is_visible() {
    return $("#aladin-container").css("visibility") != "hidden";
}

/**
 * Show status banner
 */
export function aladin_show() {
    $("#aladin-container").css("visibility", "visible");
    $("#aladin-container").css("transform", "translateX(0)");
}

/**
 * Show status banner
 */
export function aladin_hide() {
    $("#aladin-container").css("visibility", "hidden");
    $("#aladin-container").css("transform", "translateX(-100%)");
}

/**
 * Create an Aladin catalog for each style available for watchlist objects.
 *
 * Returns an object with each catalog, available as
 * aladin_catalogs[style.class_string]
*/
export function aladin_catalogs_init() {

    /**
     * Set aladin marker draw function
     *
     * Determines how the markers will look on the aladin map.
     * Takes the function to use to draw, should be one of the available on
     * shapes.js
     */
    function aladin_marker_draw(draw_function, source, context, view_params) {

        // console.log(draw_function, source, context);
        context.strokeStyle = "#FF3333";
        context.lineWidth = 3;
        context.fillStyle = "rgba(255, 204, 255, 0.4)"

        draw_function(context, [source.x, source.y], 10);
    };

    let aladin_catalogs = {};

    // TODO
    // Create aladin catalog for objects in the object catalog
    // aladin_catalogs[get_class_string(-1)] = A.catalog({
        // shape: (source, context, view_params) => {
            // aladin_marker_draw(draw_dot, source, context, view_params)
        // },
        // color: "#555555"
    // });

    for (let style of object_styles) {
        aladin_catalogs[style.class_string] = A.catalog({
            name: style.aladin_name,
            shape: (source, context, view_params) => {
                aladin_marker_draw(style.draw, source, context, view_params)
            },
            color: style.color,
        });
    }

    return aladin_catalogs;
}

/**
 * Update the objects to show on the maps
 */
export function ui_markers_update(ctx) {

    // Format the array elements to what Celestial expects
    let objs = [];
    for (let watch_dso of ctx.manager.get_watchlist()) {

        let dim = watch_dso.dso.dimensions;

        objs.push({
            // Properties not used by Celestial, but I use them
            "watch_dso": watch_dso,
            "style": watch_dso.style,

            // Properties that Celestial expects
            "type": "Feature",
            "id": watch_dso.dso.id,
            "properties": {
                "name": watch_dso.dso.name,
                "dim": `${dim[0]}x${dim[1]}`,
            },
            "geometry":{
                "type": "Point",
                "coordinates": eq_to_geo(watch_dso.dso.coords),
            }
        });
    }

    // Clean previous markers
    Celestial.clear();
    // TODO: Add issue to celestial, I would expect that these items would be
    // removed by clear()
    for (let style of object_styles) {
        Celestial.container.selectAll(`.${style.class_string}`).remove();
    }

    ctx.aladin.removeLayers();
    for (let catalog in ctx.aladin_catalogs) {
        ctx.aladin_catalogs[catalog].clear()
        ctx.aladin.addCatalog(ctx.aladin_catalogs[catalog]);
    }

    // Separate objs given on different lists depending on the style used
    // Each element of this object is a list of objects that share the same
    // style So you get something like
    // objs_by_class = {
    //     "catalog": [{obj}, {obj}, ...],    // Objects on catalog
    //     "watchlist-0": [{obj}, {obj}, ...], // Objects that share style 0
    //     "watchlist-1": [{obj}, {obj}, ...], // Objects that share style 1
    //     "watchlist-2": undefined,           // No objects share style 2
    //     "watchlist-3": [{obj}, {obj}, ...], // Objects that share style 3
    // ]
    let objs_by_class = {};

    for (let obj of objs) {

        let class_string = object_styles[obj.style].class_string;

        // If this is the first object with this class, create the list
        if (typeof objs_by_class[class_string] == "undefined") {
            objs_by_class[class_string] = [];
        }

        objs_by_class[class_string].push(obj);
    }

    Celestial.add({
        type: "line",
        callback: (error, _json) => {
            if (error) return console.warn(error);

            // For each group, each one with a style/class
            for (let class_string in objs_by_class) {

                // Load the given geoJSON objects and transform to correct
                // coordinate system, if necessary
                let data = Celestial.getData({
                    "type": "FeatureCollection",
                    "features": objs_by_class[class_string],
                }, celestial_config.transform);

                // Add to celestial objects container from d3 library
                // I guess that ".asterisms" is used by convention because it
                // works with any string
                Celestial.container.selectAll(".asterisms")
                    .data(data.features)
                    .enter().append("path")
                    .attr("class", class_string);
            }

            // Trigger redraw to display changes
            Celestial.redraw();
        },
        redraw: celestial_redraw,
    });

    // TODO: Add issue to celestial
    // Celestial.apply(config);
    // Celestial.redraw();
    // Celestial.reload(config);
    // Celestial.reproject(config);  // Not working
    // Celestial.display(config);
    Celestial._load_data();

    // Adding objects to aladin

    // For each group, each one with a style/class
    for (let class_string in objs_by_class) {

        // For each object in the group
        for (let obj of objs_by_class[class_string]) {

            ctx.aladin_catalogs[class_string].addSources(
                A.marker(
                    obj.geometry.coordinates[0],
                    obj.geometry.coordinates[1],
                    {
                        popupTitle: obj.properties.name,
                        popupDesc:
                            `${obj.watch_dso.dso.type.long_name}<br /> \
                            Magnitude: ${obj.watch_dso.dso.mag}`,
                        useMarkerDefaultIcon: false
                    }
                )
            );
        }
    }
}

/**
 * Set celestial redraw function
 *
 * Determines how the markers will look on the celestial map
 */
function celestial_redraw() {
    let text_style = {
        fill: "#FF3333",
        font: "bold 15px 'Saira Condensed', sans-serif",
        align: "left",
        baseline: "bottom"
    };
    let point_style = {
        stroke: "#FF3333",
        width: 3,
        fill: "rgba(255, 204, 255, 0.4)"
    };
    let size = 20;

    for (let style of object_styles) {

        // Select objects by style
        Celestial.container.selectAll(`.${style.class_string}`).each(d => {
            // If point is visible
            if (Celestial.clip(d.geometry.coordinates)) {

                // Get point coordinates
                let position = Celestial.mapProjection(d.geometry.coordinates);

                // Draw marker
                Celestial.setStyle(point_style);
                object_styles[style.id].draw(Celestial.context, position, size);

                // Draw text
                Celestial.setTextStyle(text_style);
                Celestial.context.fillText(
                    d.properties.name, // Text
                    position[0] + size/2 - 1, // X
                    position[1] - size/2 + 1 // Y
                );
            }
        });
    }
}
