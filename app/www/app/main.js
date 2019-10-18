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
import { DsoManager, sort } from "./dso.js";
import { TableManager } from "./tables.js";
import {
    aladin_catalogs_init,
    ui_markers_update,
    aladin_is_visible,
    aladin_show,
    aladin_hide
} from "./sky.js";
import { eq_to_geo, calculate_rise_set } from "./tools.js";
import { draw_day_night_plots } from "./plot.js";

$(document).ready(() => {

    // Define global variables inside the "context" object

    let ctx = {
        // Store username and password in plaintext, these are sent on every API
        // request. If username is null the user is logged out, so the changes
        // made will not be sent to the server, something like an "offline"
        // mode.
        username: null,
        password: null,

        // Reference to the aladin window/applet/library
        aladin: null,

        // DSO manager, keeps track of watchlist and catalogs
        manager: null,
        table_manager: null,

        // List of aladin catalogs (categories of markers, each one with a
        // different shape and color)
        aladin_catalogs: aladin_catalogs_init(),

        // OpenStreetView map
        map : null,

        // For plots. Redrawing the background takes time because we are doing
        // calculations of the sunrise and sunset for every day on the year, so
        // I keep the background and the parameters used to generate it here
        plot_bg: {
            sun_threshold_alt: -10, // Sunrise and sunset happens 10° below the
                                    // horizon
            year: null,
            location: null,
            bg_canvas: null, // Background image of daylight plot
            min_hs: null, // Fractional hours at the top of the plot
            max_hs: null // Fractional hours at the bottom of the plot

        }
    };

    // Load JSON data of objects, then start on the main() function

    $.ajax({
        type: "GET",
        url: "/data/dsos.14.json",
        dataType: "json",
    }).done(dsos_data => {

        // DSO manager, keeps track of watchlist and catalogs
        ctx.manager = new DsoManager(dsos_data, catalogs_data);
        ctx.table_manager = new TableManager(
            ctx.manager,
            null, // date
            null, // location
            15, // dso_threshold_alt
            ctx.plot_bg,
            dso => server_watchlist_add(ctx, dso.id),
            watch_dso => server_watchlist_delete(ctx, watch_dso),
            watch_dso => server_watchlist_save(ctx, watch_dso),
            dso => ui_aladin_goto(ctx, dso),
            (watch_dso, style) => ui_style_change_callback(ctx, watch_dso, style),
            (watch_dso, notes) => ui_notes_change_callback(ctx, watch_dso, notes)
        );

        main(ctx);

    }).fail((xhr, status, error) => {
        console.error("get dsos_data failed", xhr, status, error);

        status_text(`<b>Error ${xhr.status}</b>, are you having connection \
            issues?. Please <b>reload</b> this webpage.`);
        status_show();
    });

    // Init Celestial and Aladin

    Celestial.display(celestial_config);
    ctx.aladin = A.aladin("#aladin-map", {
        fov: 1,
        target: "M81", // TODO replace with coordinates so we dont use a request
        reticleColor: "rgb(0, 0, 0)", // Used on coordinates text
        showReticle: false,
    });
});

// Not used right now, idea is centering the map on someone's saved lon lat

function update_map_location(new_map) {
    console.log(new_map)
    new_map.setView(new L.LatLng(parseFloat($("#location-lat").val()), parseFloat($("#location-long").val())),2)
}

function main(ctx) {

    // Leave space so the banner is not shown above the footer

    let status_banner_height = $("#status-banner").css("height");
    $("body").css("margin-bottom", status_banner_height);

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

    ui_celestial_datetime_update(now);
    ui_plot_bg_update(ctx, now, null);
    ctx.table_manager.update_datetime_location(now, null);

    // Status bar

    $("#status-toggle").click(e => {
        if (status_is_visible()) {
            status_hide();
        } else {
            status_show();
        }
    });

    status_hide();

    // Aladin toggle

    $("#aladin-toggle").click(e => {
        if (aladin_is_visible()) {
            aladin_hide();
        } else {
            aladin_show();
        }
    });

    // Datetime form

    $("#datetime-submit").click(e => {
        e.preventDefault(); // Disable built-in HTML action
        let [year, month, day] = $("#datetime-date").val().split("-");
        let [hour, min] = $("#datetime-time").val().split(":");
        let date = new Date(year, month - 1, day, hour, min);
        ui_celestial_datetime_update(date);
        ui_plot_bg_update(ctx, date, null);
        ctx.table_manager.update_datetime_location(date, null);
    });

    // Location form

    $("#location-submit").click(e => {
        e.preventDefault(); // Disable built-in HTML action

        let data = {
            lat: parseFloat($("#location-lat").val()),
            lon: parseFloat($("#location-long").val())
        }

        submit_location(data);
    });

    // Location map

    function init_map() {
        let new_map = L.map('mapid');
        // Add OSM tile leayer to the Leaflet map.
        let osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        let osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
        let osm = new L.TileLayer(osmUrl, {attribution: osmAttrib}); // change max zoom TODO

        new_map.setView(new L.LatLng($("#location-lat").val(), $("#location-long").val()),2);
        new_map.addLayer(osm);

        function on_map_click(e) {
            let popup = L.popup({ className: ".leaflet-popup-content-wrapper" })
            	.setLatLng(e.latlng)
                .setContent(`${e.latlng["lat"].toFixed(4)}, ${e.latlng["lng"].toFixed(4)} <br> \
                            <input class="map-location-submit" type="submit" value="Update"></input>`)
            	.openOn(new_map);

            let map_data = {lat: e.latlng["lat"], lon: e.latlng["lng"]}

            $(".map-location-submit").click(e => {
                $("#location-lat").val(map_data["lat"])
                $("#location-long").val(map_data["lon"])
                submit_location(map_data);
            });
        }

        new_map.on('click', on_map_click);

        return new_map;
    }

    let make_toggle = div => {
        let button = div.find(".toggle");
        let collapse = div.find(".collapse");

        button.click(e => {
            if (collapse.css("visibility") == "hidden") {
                collapse.css("visibility", "visible");
                collapse.css("display", "block");
                ctx.map = init_map(ctx);
            } else {
                collapse.css("visibility", "hidden");
                collapse.css("display", "none");
                ctx.map.off()
                ctx.map.remove()
            }
        });
    }
    make_toggle($("#map-wrapper"));

    // Location update

    function submit_location(data) {
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
        ui_plot_bg_update(ctx, null, [data.lat, data.lon]);
        ctx.table_manager.update_datetime_location(null, [data.lat, data.lon]);
    }

    // Login buttons

    $("#login-logout").click(e => {
        // Reloading the page logs out
        window.location.reload(false); // Reload from cache
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

            $("#login-form, #register-link").css({
                "display": "none",
                "visibility": "hidden"
            });
            $("#login-welcome, #login-logout, #change-password-link").css({
                "display": "inherit",
                "visibility": "visible"
            });
            $("#login-welcome").html(`Welcome <b>${username}</b>!`);

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

    let geo_coords = eq_to_geo(dso.coords)
    aladin_show();
    ctx.aladin.gotoRaDec(
        geo_coords[0],
        geo_coords[1],
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
    Celestial.skyview({date: datetime});
}

/**
 * Redraw the daylight plot if neccesary
 *
 * If unchanged, datetime and location arguments can be null. But if the plot was
 * never drawn before, both arguments must be valid, otherwise nothing will
 * happen
 */
function ui_plot_bg_update(ctx, datetime, location) {
    let redraw = false;

    if (ctx.plot_bg.bg_canvas == null) {
        redraw = true;
    }

    if (datetime != null && ctx.plot_bg.year != datetime.getYear()) {
        ctx.plot_bg.year = datetime.getYear();
        redraw = true;
    }

    if (location != null && ctx.plot_bg.location != location) {
        ctx.plot_bg.location = location;
        redraw = true;
    }


    if (redraw && ctx.plot_bg.year != null && ctx.plot_bg.location != null) {
        let result = draw_day_night_plots(
            ctx.plot_bg.location,
            [800, 500],
            ctx.plot_bg.sun_threshold_alt,
            ctx.plot_bg.year
        );
        ctx.plot_bg.bg_canvas = result[0];
        ctx.plot_bg.min_hs = result[1];
        ctx.plot_bg.max_hs = result[2];
    }
}

/**
 * Set the observing location for the Celestial map
 */
function ui_celestial_location_update(lat, long) {
    Celestial.skyview({location: [lat, long]});
}

/**
 * This function should be called when the style of an object changes on the UI
 */
function ui_style_change_callback(ctx, watch_dso, style_id) {

    ctx.table_manager.watchlist_set_unsaved(watch_dso);

    // Update the watchlist object
    watch_dso.style = style_id;

    // Update the map
    ui_markers_update(ctx);
}

/**
 * This function should be called when the notes of an object changes on the UI
 */
function ui_notes_change_callback(ctx, watch_dso, notes) {

    ctx.table_manager.watchlist_set_unsaved(watch_dso);

    // Update the watchlist object
    watch_dso.notes = notes;
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
        ui_plot_bg_update(ctx, null, [json.lat, json.lon]);
        ctx.table_manager.update_datetime_location(null, [json.lat, json.lon]);

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

        // Check the API, the field is named star_id instead of just id
        for (let obj of json) {
            let watch_dso = ctx.manager.watchlist_add(obj.star_id, obj.notes, obj.style);
        }

        ctx.table_manager.watchlist_update();

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
    ctx.table_manager.watchlist_remove(watch_dso);

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
    ctx.table_manager.watchlist_add(watch_dso);

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

        }).fail((xhr, status, error) => {
            console.error("server_watchlist_save() failed", xhr, status, error);

            status_text(`<b>Error ${xhr.status}</b>, your changes are not
                being saved!, reload the page and try again later.`);
            status_show();
        });
    }

    ctx.table_manager.watchlist_set_saved(watch_dso);

    ui_markers_update(ctx);
}
