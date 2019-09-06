"use strict";

import { catalog } from "./catalog.js";
import {
    status_is_visible,
    status_hide,
    status_show,
    status_text
} from "./status.js";
import { object_styles } from "./const.js";
import { config } from "./config.js";
import * as data from "./data.js";
import {
    watchlist_create_header,
    watchlist_create_row,
    watchlist_delete_row,
    watchlist_delete_row_all,
    catalog_create
} from "./tables.js";

$(document).ready(function() {

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

    // Watchlist of the user
    ctx.watchlist = [];

    // TODO
    // Create aladin catalog for objects in the object catalog
    // ctx.aladin_catalogs[get_class_string(-1)] = A.catalog({
        // shape: function(source, context, view_params) {
            // aladin_marker_draw(draw_dot, source, context, view_params)
        // },
        // color: "#555555"
    // });

    // Create aladin catalog for objects in "watchlist-{i}", one for each
    // available style
    for (let i = 0; i < object_styles.length; i++) {
        ctx.aladin_catalogs[get_class_string(i)] = A.catalog({
            name: object_styles[i].aladin_name,
            shape: function(source, context, view_params) {
                aladin_marker_draw(object_styles[i].draw, source, context, view_params)
            },
            color: object_styles[i].color,
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
    }).done(function(dsos_data) {
        main(ctx, dsos_data);
    }).fail(function(xhr, status, error) {
        console.error("get dsos_data failed", xhr, status, error);

        status_text(`<b>Error ${xhr.status}</b>, are you having connection \
            issues?. Please <b>reload</b> this webpage.`);
        status_show();
    });
});

function main(ctx, dsos_data) {

    Celestial.display(config);
    ctx.aladin = A.aladin("#aladin-map", {
        fov: 1,
        target: "M31",
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

    $("#info-toggle").click(function(e) {
        if (status_is_visible()) {
            status_hide();
        } else {
            status_show();
        }
    });

    status_hide();

    $("#datetime-submit").click(function(e) {
        e.preventDefault(); // Disable built-in HTML action
        let [year, month, day] = $("#datetime-date").val().split("-");
        let [hour, min] = $("#datetime-time").val().split(":");
        let date = new Date(year, month, day, hour, min);
        update_map_datetime(date);
    });

    $("#location-submit").click(function(e) {
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
            }).done(function(response) {
                console.log("location submitted to server");
            }).fail(function(xhr, status, error) {
                console.error("location submit to server failed",
                    xhr, status, error);

                status_text(`<b>Error ${xhr.status}</b>, your changes are not \
                    being saved!, reload the page and try again later.`);
                status_show();
            });
        }

        update_map_location(data.lat, data.lon);
    });

    $("#login-form").submit(function(e) {
        e.preventDefault(); // Disable built-in HTML action

        let username = $("#login-username").val();
        let password = $("#login-password").val();

        $.ajax({
            type: "GET",
            url: "/api/v1/login",
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password)
            },
        }).done(function(response) {
            ctx.username = username;
            ctx.password = password;

            watchlist_get_all(ctx, dsos_data);
            location_get(ctx);

            status_text(`Welcome <b>${username}</b>!`);
            status_hide();
        }).fail(function(xhr, status, error) {
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

    catalog_create(
        dsos_data,
        null,
        catalog,
        function(id) { watchlist_add(ctx, dsos_data, id); },
        function(id) { object_goto(ctx, dsos_data, id); }
    );

}

/**
 * Return true if we are logged in
 */
function logged_in(ctx) {
    return ctx.username != null;
}

/**
 * Show given id on the sky survey map
 */
function object_goto(ctx, dsos_data, id) {
    let dim = data.get_dimensions(dsos_data, id);

    ctx.aladin.gotoRaDec(
        data.get_ra(dsos_data, id),
        data.get_dec(dsos_data, id)
    );

    // Set FOV to the biggest of width,height of object, convert dimensions from
    // arcminutes to degrees
    ctx.aladin.setFov(Math.max(dim[0], dim[1]) / 60);

    // Scroll page to map
    window.location.hash = "aladin-map";
}

/**
 * Set the observing time for the Celestial map
 */
function update_map_datetime(datetime) {
    Celestial.date(datetime);
    Celestial._go();
}

/**
 * Set the observing location for the Celestial map
 */
function update_map_location(lat, long) {
    Celestial._location(lat, long);
    Celestial._go();
}

/**
 * Get location from server and update the map and location form
 */
function location_get(ctx) {
    $.ajax({
        type: "GET",
        url: "/api/v1/location",
        headers: {
            "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
        },
        dataType: "json",
    }).done(function(json) {

        $("#location-lat").val(`${json.lat}`);
        $("#location-long").val(`${json.lon}`);
        update_map_location(json.lat, json.lon);

    }).fail(function(xhr, status, error) {
        console.error("location_get() failed", xhr, status, error);

        status_text(`<b>Error ${xhr.status}</b>, your changes are not being \
            saved!, reload the page and try again later.`);
        status_show();
    });

}

/**
 * This function should be called when the style of an object changes.
 *
 * This function us used as a callback to $(".objects-style select").change(),
 * so the argument "select" should refer to the select element
 */
function watchlist_style_change(ctx, dsos_data, select) {
    // this is the select, the parent is a "td" and the parent-parent is the
    // "tr" who has an id of "watchlist-obj-{id}"
    let row = $(select).closest("tr");

    let id = parseInt(row.attr("id").split("-")[2]);

    // Enable the save button
    row.find(".objects-save").prop("disabled", false);

    // Update the watchlist object
    let index = ctx.watchlist.findIndex((obj) => {
        return obj.id == id;
    });
    ctx.watchlist[index].style = get_style_id($(select).val());

    update_map_markers(ctx, dsos_data, ctx.watchlist);
}

/**
 * This function should be called when the notes of an object changes.
 *
 * This function us used as a callback to $(".objects-style textarea").change()
 */
function watchlist_notes_change(ctx, id) {
    // Enable the save button
    $(`#watchlist-obj-${id} .objects-save`).prop("disabled", false);
}

/**
 * Delete object from watchlist
 *
 * Deletes both on server and on client
 */
function watchlist_delete(ctx, dsos_data, id) {
    let index = ctx.watchlist.findIndex((obj) => {
        return obj.id == id;
    });
    if (index < 0) {
        console.error(`Tried to delete unexistent watchlist object id ${id}`);
        return;
    }

    if (logged_in(ctx)) {
        $.ajax({
            type: "DELETE",
            url: `/api/v1/watchlist/${id}`,
            headers: {
                "Authorization": "Basic "
                    + btoa(ctx.username + ":" + ctx.password)
            },
        }).done(function(response) {

        }).fail(function(xhr, status, error) {
            console.error("watchlist_delete() failed", xhr, status, error);

            status_text(`<b>Error ${xhr.status}</b>, your changes are not \
                being saved!, reload the page and try again later.`);
            status_show();
        });
    }

    // Remove the element from the table
    watchlist_delete_row(id);
    if (index > -1) {
        // Remove the element from the watchlist
        ctx.watchlist.splice(index, 1);
    }
    update_map_markers(ctx, dsos_data, ctx.watchlist);

}

/**
 * Add object to watchlist, both on client and on server
 */
function watchlist_add(ctx, dsos_data, id) {

    // Check if the object already exists
    let index = ctx.watchlist.findIndex((obj) => {
        return obj.id == id;
    });
    if (index > -1) {
        console.error("Element already exists id:", id);
        return;
    }

    let style = 0;
    let notes = "";

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
                star_id: id,
                notes: notes,
                style: style,
            }),
        }).done(function(response) {

        }).fail(function(xhr, status, error) {
            console.error("watchlist_add() failed", xhr, status, error);

            status_text(`<b>Error ${xhr.status}</b>, your changes are not \
                being saved!, reload the page and try again later.`);
            status_show();
        });
    }

    watchlist_create_row(
        dsos_data,
        id,
        notes,
        style,
        function(id) { watchlist_delete(ctx, dsos_data, id); },
        function(id) { watchlist_save(ctx, dsos_data, id); },
        function(id) { object_goto(ctx, dsos_data, id); },
        function(select) { watchlist_style_change(ctx, dsos_data, select); },
        function(id) { watchlist_notes_change(ctx, id); }
    ).appendTo("#watchlist-table tbody");

    if (!logged_in(ctx)) {
        // Hide the save buttons
        $(".objects-save").css("display", "none");
    }

    ctx.watchlist.push({
        id: id,
        notes: notes,
        style: style
    });

    update_map_markers(ctx, dsos_data, ctx.watchlist);
}

/**
 * Get the integer that represents a style by its name
 *
 * If the given name could not be found returns -1
 */
function get_style_id(style_name) {
    for (let i = 0; i < object_styles.length; i++) {
        if (object_styles[i].name == style_name) {
            return i;
        }
    }
    return -1;
}

/**
 * Save changes on given object id to server
 */
function watchlist_save(ctx, dsos_data, id) {

    let notes = $(`#watchlist-obj-${id} .objects-notes textarea`).val();
    let style = get_style_id(
        $(`#watchlist-obj-${id} .objects-style select`).val()
    );

    if (logged_in(ctx)) {
        $.ajax({
            type: "PUT",
            url: `/api/v1/watchlist/${id}`,
            headers: {
                "Authorization": "Basic "
                    + btoa(ctx.username + ":" + ctx.password)
            },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                star_id: id,
                notes: notes,
                style: style,
            }),
        }).done(function(response) {
            console.log("watchlist_save() successful");
            $(`#watchlist-obj-${id} .objects-save`).prop("disabled", true);
        }).fail(function(xhr, status, error) {
            console.error("watchlist_save() failed", xhr, status, error);

            status_text(`<b>Error ${xhr.status}</b>, your changes are not
                being saved!, reload the page and try again later.`);
            status_show();
        });
    }

    update_map_markers(ctx, dsos_data, ctx.watchlist);
}

/**
 * Replace client watchlist with watchlist from server
 */
function watchlist_get_all(ctx, dsos_data) {
    $.ajax({
        type: "GET",
        url: "/api/v1/watchlist",
        headers: {
            "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
        },
        dataType: "json",
    }).done(function(json) {

        // Check the API, the field is named star_id instead of just id
        for (let obj of json) {
            obj.id = obj.star_id;
            obj.star_id = undefined;
        }
        ctx.watchlist = json;

        watchlist_delete_row_all();

        for (let obj of ctx.watchlist) {
            watchlist_create_row(
                dsos_data,
                obj.id,
                obj.notes,
                obj.style,
                function(id) { watchlist_delete(ctx, dsos_data, id); },
                function(id) { watchlist_save(ctx, dsos_data, id); },
                function(id) { object_goto(ctx, dsos_data, id); },
                function(select) { watchlist_style_change(ctx, dsos_data, select); },
                function(id) { watchlist_notes_change(ctx, id); }
            ).appendTo("#watchlist-table tbody");
        }
        update_map_markers(ctx, dsos_data, ctx.watchlist);

    }).fail(function(xhr, status, error) {
        console.error("watchlist_get_all() failed", xhr, status, error);

        status_text(`<b>Error ${xhr.status}</b>, your changes are not being \
            saved!, reload the page and try again later.`);
        status_show();
    });
}


/**
 * Translate the given integer to a class string
 *
 * Mapping:
 *
 * - -1: "catalog"
 * - 0: "watchlist-0"
 * - 1: "watchlist-1"
 * - 2: "watchlist-2"
 * - ...
 *
 * Used to indicate the style of an object. I use it to work with Celestial or
 * Aladin
 */
function get_class_string(style) {
    let class_string = "catalog";
    if (style >= 0)
    {
        class_string = `watchlist-${style}`;
    }
    return class_string;
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

    for (let style = 0; style < object_styles.length; style++) {
        let class_string = get_class_string(style);

        // Select objects by style
        Celestial.container.selectAll(`.${class_string}`).each(function(d) {
            // If point is visible
            if (Celestial.clip(d.geometry.coordinates)) {

                // Get point coordinates
                let position = Celestial.mapProjection(d.geometry.coordinates);

                // Draw marker
                Celestial.setStyle(point_style);
                object_styles[style].draw(Celestial.context, position, size);

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

/**
 * Update the objects to show on the maps.
 *
 * Provide a list of objects to show. Most properties are taken directly from
 * the json database.
 *
 * The style must be an integer, -1 means that the object is from the catalog,
 * numbers from 0 represent styles from const.js:object_styles
 *
 * Example of obj argument:
 * [
 *     {
 *         "type": "Feature",
 *         "id": 43,
 *         "style": 2,
 *         "properties": {
 *             "name": "NGC 54",
 *             "dim": "1.5x3" // Size in arcminutes
 *         },
 *         "geometry":{
 *             "type": "Point",
 *             "coordinates": [-80.7653, 38.7837]
 *         }
 *     },
 *     ...
 *  ]
 *
 */
function update_map_markers(ctx, dsos_data, watchlist) {

    // Format the array elements to what Celestial expects
    let objs = [];
    for (let obj of watchlist) {
        let dim = data.get_dimensions(dsos_data, obj.id);

        objs.push({
            "type": "Feature",
            "id": obj.id,
            "style": obj.style,
            "properties": {
                "name": data.get_name(dsos_data, obj.id),
                "dim": `${dim[0]}x${dim[1]}`,
            },
            "geometry":{
                "type": "Point",
                "coordinates": [
                    data.get_ra(dsos_data, obj.id),
                    data.get_dec(dsos_data, obj.id),
                ],
            }
        });
    }

    // Clean previous markers
    Celestial.clear();
    // TODO: Add issue to celestial, I would expect that these items would be
    // removed by clear()
    for (let i = 0; i < object_styles.length; i++) {
        Celestial.container.selectAll(`.${get_class_string(i)}`).remove();
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
    //     "wishlist-0": [{obj}, {obj}, ...], // Objects that share style 0
    //     "wishlist-1": [{obj}, {obj}, ...], // Objects that share style 1
    //     "wishlist-2": undefined,           // No objects share style 2
    //     "wishlist-3": [{obj}, {obj}, ...], // Objects that share style 3
    // ]
    let objs_by_class = {};

    for (let obj of objs) {

        let class_string = get_class_string(obj.style);

        // If this is the first object with this class, create the list
        if (typeof objs_by_class[class_string] == "undefined") {
            objs_by_class[class_string] = [];
        }

        objs_by_class[class_string].push(obj);
    }

    Celestial.add({
        type: "line",
        callback: function(error, _json) {
            if (error) return console.warn(error);

            // For each group, each one with a style/class
            for (let class_string in objs_by_class) {

                // Load the given geoJSON objects and transform to correct
                // coordinate system, if necessary
                let data = Celestial.getData({
                    "type": "FeatureCollection",
                    "features": objs_by_class[class_string],
                }, config.transform);

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
                            `${data.get_type(dsos_data, obj.id)}<br /> \
                            Magnitude: ${data.get_mag(dsos_data, obj.id)}`,
                        useMarkerDefaultIcon: false
                    }
                )
            );
        }
    }
}
