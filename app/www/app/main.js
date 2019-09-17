"use strict";

import { celestial_config } from "./config.js";
import { catalog as catalogs_data } from "./catalog.js";
import {
    status_is_visible,
    status_hide,
    status_show,
    status_text
} from "./status.js";
import { object_styles } from "./const.js";
import { DsoManager } from "./dso.js";
import {
    watchlist_create_header,
    watchlist_create_row,
    catalog_create_header,
    catalog_create_row,
    watchlist_delete_row_all
} from "./tables.js";

$(document).ready(() => {

    // Define global variables inside the "context" object

    let ctx = {};

    // Store username and password in plaintext, these are sent on every API
    // request. If username is null the user is logged out, so the changes made
    // will not be sent to the server, something like an "offline" mode.
    ctx.username = null;
    ctx.password = null;

    // Reference to the aladin window/applet/library
    ctx.aladin = null;

    // List of aladin catalogs (categories of markers, each one with a different
    // shape and color)
    ctx.aladin_catalogs = {};

    // DSO manager, keeps track of watchlist and catalogs
    ctx.manager = null;

    // TODO
    // Create aladin catalog for objects in the object catalog
    // ctx.aladin_catalogs[get_class_string(-1)] = A.catalog({
        // shape: (source, context, view_params) => {
            // aladin_marker_draw(draw_dot, source, context, view_params)
        // },
        // color: "#555555"
    // });

    // Create aladin catalog for objects in "watchlist-{i}", one for each
    // available style
    for (let style of object_styles) {
        ctx.aladin_catalogs[style.class_string] = A.catalog({
            name: style.aladin_name,
            shape: (source, context, view_params) => {
                aladin_marker_draw(style.draw, source, context, view_params)
            },
            color: style.color,
        });
    }

    // Leave space so the banner is not shown above the footer
    let info_banner_height = $("#info-banner").css("height");
    $("body").css("margin-bottom", info_banner_height);

    // Load JSON data of objects, then start on the main() function

    $.ajax({
        type: "GET",
        url: "/data/dsos.14.json",
        dataType: "json",
    }).done(dsos_data => {

        // DSO manager, keeps track of watchlist and catalogs
        ctx.manager = new DsoManager(dsos_data, catalogs_data);

        main(ctx);

    }).fail((xhr, status, error) => {
        console.error("get dsos_data failed", xhr, status, error);

        status_text(`<b>Error ${xhr.status}</b>, are you having connection \
            issues?. Please <b>reload</b> this webpage.`);
        status_show();
    });
});

function main(ctx) {

    Celestial.display(celestial_config);
    ctx.aladin = A.aladin("#aladin-map", {
        fov: 1,
        target: "M81",
        reticleColor: "rgb(0, 0, 0)", // Used on coordinates text
        showReticle: false,
    });

    // Set current time and date of forms

    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1; // Otherwise returns from 0 to 11
    let year = now.getFullYear();
    let hour = now.getHours();
    let min  = now.getMinutes();

    // Add leading zeroes so each one always has two digits
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;

    $("#datetime-date").val(`${year}-${month}-${day}`);
    $("#datetime-time").val(`${hour}:${min}`);

    $("#info-toggle").click(e => {
        if (status_is_visible()) {
            status_hide();
        } else {
            status_show();
        }
    });

    let make_toggle = (button, collapse) => {
        button.click(e => {
            if (collapse.css("visibility") == "hidden") {
                collapse.css("visibility", "visible");
                collapse.css("display", "block");
            } else {
                collapse.css("visibility", "hidden");
                collapse.css("display", "none");
            }
        });
    }

    make_toggle($("#watchlist-filter-toggle"), $("#watchlist-filter-collapse"));
    make_toggle($("#catalog-filter-toggle"), $("#catalog-filter-collapse"));

    status_hide();

    $("#datetime-submit").click(e => {
        e.preventDefault(); // Disable built-in HTML action
        let [year, month, day] = $("#datetime-date").val().split("-");
        let [hour, min] = $("#datetime-time").val().split(":");
        let date = new Date(year, month, day, hour, min);
        ui_celestial_datetime_update(date);
    });

    $("#location-submit").click(e => {
        e.preventDefault(); // Disable built-in HTML action

        let data = {
            lat: parseFloat($("#location-lat").val()),
            lon: parseFloat($("#location-long").val())
        }

        if (logged_in(ctx)) {
            $.ajax({
                type: "PUT",
                url: "/api/v1/location",
                headers: {
                    "Authorization": "Basic "
                        + btoa(ctx.username + ":" + ctx.password)
                },
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
            }).done(response => {

            }).fail((xhr, status, error) => {
                console.error("location submit to server failed",
                    xhr, status, error);

                status_text(`<b>Error ${xhr.status}</b>, your changes are not \
                    being saved!, reload the page and try again later.`);
                status_show();
            });
        }

        ui_celestial_location_update(data.lat, data.lon);
    });

    $("#login-form").submit(e => {
        e.preventDefault(); // Disable built-in HTML action

        let username = $("#login-username").val();
        let password = $("#login-password").val();

        $.ajax({
            type: "GET",
            url: "/api/v1/login",
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password)
            },
        }).done(response => {
            ctx.username = username;
            ctx.password = password;

            server_watchlist_get(ctx);
            server_location_get(ctx);

            status_text(`Welcome <b>${username}</b>!`);
            status_hide();
        }).fail((xhr, status, error) => {
            console.error("login form submit failed", xhr, status, error);

            if (xhr.status == 401) {
                $("#login-password").val("");
                status_text("<b>Username or password incorrect</b>, try again.");
                status_show();
            } else {
                status_text(`<b>Error ${xhr.status}</b>, try again later.`);
                status_show();
            }
        });
    });

    watchlist_create_header($("#watchlist-table thead tr"));

    // Create catalog table
    // TODO: Add filters

    catalog_create_header($("#catalog-table thead tr"));

    for (let i = 0; i < ctx.manager.catalog.length; i++) {
        if (i >= 99) { break; }

        let dso = ctx.manager.catalog[i]
        catalog_create_row(
            dso,
            dso => server_watchlist_add(ctx, dso.id),
            dso => ui_aladin_goto(ctx, dso),
        ).appendTo("#catalog-table tbody");
    }
}

/**
 * Return true if we are logged in
 */
function logged_in(ctx) {
    return ctx.username != null;
}

/**
 * Show given dso on the aladin map
 */
function ui_aladin_goto(ctx, dso) {

    ctx.aladin.gotoRaDec(
        dso.coords[0],
        dso.coords[1],
    );

    // Set FOV to the biggest of width,height of object, convert dimensions from
    // arcminutes to degrees
    let dim = dso.dimensions;
    ctx.aladin.setFov(Math.max(dim[0], dim[1]) / 60);

    // Scroll page to map
    window.location.hash = "sky-surveys";
}

/**
 * Set the observing time for the Celestial map
 */
function ui_celestial_datetime_update(datetime) {
    Celestial.date(datetime);
    Celestial._go();
}

/**
 * Set the observing location for the Celestial map
 */
function ui_celestial_location_update(lat, long) {
    Celestial._location(lat, long);
    Celestial._go();
}

/**
 * Update the objects to show on the maps
 */
function ui_markers_update(ctx) {

    // Format the array elements to what Celestial expects
    let objs = [];
    for (let watch_dso of ctx.manager.watchlist) {

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
                "coordinates": watch_dso.dso.coords,
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
 * This function should be called when the style of an object changes on the UI
 */
function ui_style_change_callback(ctx, watch_dso, style_id) {

    // Enable the save button
    let tr = watch_dso.get_watchlist_tr();
    tr.find(".objects-save").prop("disabled", false);

    // Update the watchlist object
    watch_dso.style = style_id;

    // Update the map
    ui_markers_update(ctx);
}

/**
 * This function should be called when the notes of an object changes on the UI
 */
function ui_notes_change_callback(watch_dso) {
    // Enable the save button
    let tr = watch_dso.get_watchlist_tr();
    tr.find(".objects-save").prop("disabled", false);
}

/**
 * Get location from server and update the user interface accordingly
 */
function server_location_get(ctx) {
    $.ajax({
        type: "GET",
        url: "/api/v1/location",
        headers: {
            "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
        },
        dataType: "json",
    }).done(json => {

        $("#location-lat").val(`${json.lat}`);
        $("#location-long").val(`${json.lon}`);
        ui_celestial_datetime_update(json.lat, json.lon);

    }).fail((xhr, status, error) => {
        console.error("server_location_get() failed", xhr, status, error);

        status_text(`<b>Error ${xhr.status}</b>, your changes are not being \
            saved!, reload the page and try again later.`);
        status_show();
    });

}

/**
 * Load watchlist from server
 */
function server_watchlist_get(ctx) {
    $.ajax({
        type: "GET",
        url: "/api/v1/watchlist",
        headers: {
            "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
        },
        dataType: "json",
    }).done(json => {

        watchlist_delete_row_all();

        // Check the API, the field is named star_id instead of just id
        for (let obj of json) {

            let watch_dso = ctx.manager.watchlist_add(obj.star_id, obj.notes, obj.style);

            if (watch_dso != null) {
                ui_watchlist_table_insert(ctx, watch_dso);
            }
        }

        ui_markers_update(ctx);

    }).fail((xhr, status, error) => {
        console.error("server_watchlist_get() failed", xhr, status, error);

        status_text(`<b>Error ${xhr.status}</b>, your changes are not being \
            saved!, reload the page and try again later.`);
        status_show();
    });
}


/**
 * Delete object from watchlist, both on server and on client
 */
function server_watchlist_delete(ctx, watch_dso) {

    ctx.manager.watchlist_remove(watch_dso);
    ui_watchlist_table_remove(ctx, watch_dso);

    if (logged_in(ctx)) {
        $.ajax({
            type: "DELETE",
            url: `/api/v1/watchlist/${watch_dso.dso.id}`,
            headers: {
                "Authorization": "Basic "
                    + btoa(ctx.username + ":" + ctx.password)
            },
        }).done(response => {

        }).fail((xhr, status, error) => {
            console.error("server_watchlist_delete() failed", xhr, status, error);

            status_text(`<b>Error ${xhr.status}</b>, your changes are not \
                being saved!, reload the page and try again later.`);
            status_show();
        });
    }

    ui_markers_update(ctx);

}

/**
 * Add object to watchlist, both on client and on server
 */
function server_watchlist_add(ctx, id) {

    let watch_dso = ctx.manager.watchlist_add(id, null, null);

    if (watch_dso == null) { // Object already in watchlist
        return;
    }

    if (logged_in(ctx)) {
        $.ajax({
            type: "POST",
            url: "/api/v1/watchlist",
            headers: {
                "Authorization": "Basic "
                    + btoa(ctx.username + ":" + ctx.password)
            },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                star_id: watch_dso.dso.id,
                notes: watch_dso.notes,
                style: watch_dso.style,
            }),
        }).done(response => {

        }).fail((xhr, status, error) => {
            console.error("server_watchlist_add() failed", xhr, status, error);

            status_text(`<b>Error ${xhr.status}</b>, your changes are not \
                being saved!, reload the page and try again later.`);
            status_show();
        });
    }

    ui_watchlist_table_insert(ctx, watch_dso);

    ui_markers_update(ctx);
}

/**
 * Save changes on given object id to server
 */
function server_watchlist_save(ctx, watch_dso) {

    let tr = watch_dso.get_watchlist_tr();
    let notes = tr.find(".objects-notes textarea").val();
    let style = tr.find(".objects-style select").index();

    if (logged_in(ctx)) {
        $.ajax({
            type: "PUT",
            url: `/api/v1/watchlist/${watch_dso.dso.id}`,
            headers: {
                "Authorization": "Basic "
                    + btoa(ctx.username + ":" + ctx.password)
            },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                star_id: watch_dso.dso.id,
                notes: notes,
                style: style,
            }),
        }).done(response => {
            tr.find(".objects-save").prop("disabled", true);
        }).fail((xhr, status, error) => {
            console.error("server_watchlist_save() failed", xhr, status, error);

            status_text(`<b>Error ${xhr.status}</b>, your changes are not
                being saved!, reload the page and try again later.`);
            status_show();
        });
    }

    ui_markers_update(ctx);
}

/**
 * Insert row on watchlist table
 */
function ui_watchlist_table_insert(ctx, watch_dso) {

    let tr = watchlist_create_row(
        watch_dso,
        watch_dso => server_watchlist_delete(ctx, watch_dso),
        watch_dso => server_watchlist_save(ctx, watch_dso),
        watch_dso => ui_aladin_goto(ctx, watch_dso.dso),
        (watch_dso, style) => ui_style_change_callback(ctx, watch_dso, style),
        watch_dso => ui_notes_change_callback(watch_dso)
    );

    if (!logged_in(ctx)) {
        // Hide the save buttons
        tr.find(".objects-save").css("display", "none");
    }

    watch_dso.set_watchlist_tr(tr);
    tr.appendTo("#watchlist-table tbody");
}

/**
 * Insert row on watchlist table
 */
function ui_watchlist_table_remove(ctx, watch_dso) {

    let tr = watch_dso.get_watchlist_tr();
    tr.remove();
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

