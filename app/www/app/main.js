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
import {
    watchlist_create_header,
    watchlist_create_row,
    catalog_create_header,
    catalog_create_row,
    watchlist_delete_row_all,
    catalog_delete_row_all
} from "./tables.js";
import { aladin_catalogs_init, ui_markers_update } from "./sky.js";

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

        // List of aladin catalogs (categories of markers, each one with a
        // different shape and color)
        aladin_catalogs: aladin_catalogs_init()
    };

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

    // Init Celestial and Aladin

    Celestial.display(celestial_config);
    ctx.aladin = A.aladin("#aladin-map", {
        fov: 1,
        target: "M81", // TODO replace with coordinates so we dont use a request
        reticleColor: "rgb(0, 0, 0)", // Used on coordinates text
        showReticle: false,
    });

});

function main(ctx) {

    // Leave space so the banner is not shown above the footer

    let info_banner_height = $("#info-banner").css("height");
    $("body").css("margin-bottom", info_banner_height);

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

    // Status bar

    $("#info-toggle").click(e => {
        if (status_is_visible()) {
            status_hide();
        } else {
            status_show();
        }
    });

    status_hide();

    // Table filters toggle

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

    // Datetime form

    $("#datetime-submit").click(e => {
        e.preventDefault(); // Disable built-in HTML action
        let [year, month, day] = $("#datetime-date").val().split("-");
        let [hour, min] = $("#datetime-time").val().split(":");
        let date = new Date(year, month, day, hour, min);
        ui_celestial_datetime_update(date);
    });

    // Location form

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

    // Watchlist filters

    $("#watchlist-filter").submit(e => {
        e.preventDefault(); // Disable built-in HTML action

        ui_watchlist_filter(ctx);
    });

    // Catalog filters

    // TODO: Move
    {
        let fieldset = $("#catalog-filter-appears-on-fieldset");

        let catalogs = [];
        for (let dso of ctx.manager.get_catalog()) {
            for (let catalog of dso.appears_on) {
                if (!catalogs.includes(catalog)) {
                    catalogs.push(catalog);
                }
            }
        }
        for (let catalog of catalogs) {
            fieldset.append(
                $("<div>").append(
                    $("<input>", {
                        type: "checkbox",
                        checked: true,
                        name: catalog,
                        id: `catalog-filter-catalog-${catalog}`
                    }),
                    $("<label>", {
                        for: `catalog-filter-catalog-${catalog}`,
                        text: `${catalog}`,
                    })
                )
            );
        }
        fieldset.append(
            $("<div>").append(
                $("<input>", {
                    type: "checkbox",
                    checked: false,
                    name: "Unlisted",
                    id: `catalog-filter-catalog-unlisted`
                }),
                $("<label>", {
                    for: `catalog-filter-catalog-unlisted`,
                    text: "Unlisted (unpopular DSOs)",
                })
            )
        );
    }

    $("#catalog-filter").submit(e => {
        e.preventDefault(); // Disable built-in HTML action

        // ctx.manager.catalog_set_sort(sort.name);
        // ctx.manager.catalog_set_filter(dso => dso.appears_on.length > 0);
        // ctx.manager.catalog_set_filter(dso => dso.mag < 2);
        let search_string = $("#catalog-filter-search").val();

        let selected_catalogs = [];
        $("#catalog-filter-appears-on-fieldset input").each(function() {
            if (this.checked) {
                selected_catalogs.push(this.name);
            }
        });

        // True or false if we are filtering or not
        let filtering_catalogs = selected_catalogs.length > 0 && !selected_catalogs.includes("Unlisted");
        let filtering_search = search_string.length > 0

        console.log(filtering_catalogs, filtering_search, selected_catalogs, search_string);

        ctx.manager.catalog_set_filter(dso => {
            if (filtering_catalogs) {
                if (!selected_catalogs.some(
                        catalog => dso.appears_on.includes(catalog))) {
                    // The dso does not appear on any of the selected catalogs
                    return false;
                }
            }

            if (filtering_search) {
                if (!dso.name.includes(search_string)) {
                    return false;
                }
            }
            return true;
        });

        catalog_delete_row_all();

        let results = ctx.manager.get_catalog_view();

        if (results.length != 0) {
            for (let dso of ctx.manager.get_catalog_view()) {
                ui_catalog_table_insert(ctx, dso);
            }
        } else {
            $("#catalog-table tbody").append(
                $("<tr>").append(
                    $("<td>", {
                        colspan: "99",
                        text: `Your search gave no results, check your filter \
                               settings too`
                    })
                )
            );
        }
    });

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
            $("#login-welcome, #login-logout").css({
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

    // Initialize tables

    watchlist_create_header($("#watchlist-table thead tr"));

    $("#watchlist-table tbody").append(
        $("<tr>").append(
            $("<td>", {
                colspan: "99",
                text: `Nothing here, add some objects from the catalog below \
                       or check your filters above.`
            })
        )
    );

    catalog_create_header($("#catalog-table thead tr"));

    // ctx.manager.catalog_set_sort(sort.name);
    // ctx.manager.catalog_set_filter(dso => dso.appears_on.length > 0);
    // ctx.manager.catalog_set_filter(dso => dso.mag < 2);

    for (let dso of ctx.manager.get_catalog_view()) {
        ui_catalog_table_insert(ctx, dso);
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

    // Update the watchlist object
    watch_dso.notes = tr.find(".objects-notes textarea").val();
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
 * Filter, sort and show watchlist
 */
function ui_watchlist_filter(ctx) {

    watchlist_delete_row_all();

    // ctx.manager.get_watchlist().sort((a, b) => a.dso.id - b.dso.id);

    for (let watch_dso of ctx.manager.get_watchlist()) {

        ui_watchlist_table_insert(ctx, watch_dso);
    }
}

/**
 * Insert row on catalog table
 */
function ui_catalog_table_insert(ctx, dso) {

    let tbody = $("#catalog-table tbody");

    if (tbody.children().length <= 100) {

        let tr = catalog_create_row(
            dso,
            dso => server_watchlist_add(ctx, dso.id),
            dso => ui_aladin_goto(ctx, dso),
        );

        dso.set_catalog_tr(tr);
        tbody.append(tr);

    } else {
        // TODO
        console.log("Too many catalog entries");
    }
}

/**
 * Insert row on watchlist table
 */
function ui_watchlist_table_insert(ctx, watch_dso) {

    let tbody = $("#watchlist-table tbody");

    if (tbody.children().length <= 100) {

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
        tbody.append(tr);

    } else {
        // TODO
        console.log("Too many watchlist entries");
    }
}

/**
 * Insert row on watchlist table
 */
function ui_watchlist_table_remove(ctx, watch_dso) {

    let tr = watch_dso.get_watchlist_tr();
    tr.remove();
}
