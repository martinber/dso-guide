"use strict";

$(document).ready(function() {

});

$(document).ready(function() {

    let parametros = {
        type: "GET",
        url: "/data/dsos.14.json",
        dataType: "json",
    };

    function function_correcto(response) {
        print(response.star_id)
    }

    function function_incorrecto(xhr, status, error) {
        console.error("get dsos_data failed", xhr, status, error);
    }

    $.ajax(parametros).done(funcion_correcto).fail(function_incorrecto);

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
    var day = now.getDate();
    var month = now.getMonth() + 1; // Otherwise returns from 0 to 11
    var year = now.getFullYear();
    var hour = now.getHours();
    var min  = now.getMinutes();

    // Add leading zeroes so each one always has two digits
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;

    $("#datetime-date").val(`${year}-${month}-${day}`);
    $("#datetime-time").val(`${hour}:${min}`);

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

        $.ajax({
            type: "PUT",
            url: "/api/v1/location",
            headers: {
                "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
            },
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
        }).done(function(response) {
            console.log("location submitted to server");
        }).fail(function(xhr, status, error) {
            console.error("location submit to server failed", xhr, status, error);
        });

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
            // TODO: Chequear si es correcto, capaz que al recibir 405 se entre
            // acá
            ctx.username = username;
            ctx.password = password;
            watchlist_get_all(ctx, dsos_data);
            location_get(ctx);
        }).fail(function(xhr, status, error) {
            console.error("login form submit failed", xhr, status, error);
        });
    });

    $("#register-form").submit(function(e) {
        e.preventDefault(); // Disable built-in HTML action
        // TODO
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            data: $(this).serialize(),
            contentType: "application/json",
        }).done(function(response) {
            console.log("intentado_registrarse");
            // TODO
        }).fail(function(xhr, status, error) {
            console.error("register form sumbit failed", xhr, status, error);
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
    });

}


/**
 * Delete object from watchlist
 *
 * Deletes both on server and on client
 */
function watchlist_delete(ctx, dsos_data, id) {
    $.ajax({
        type: "DELETE",
        url: `/api/v1/watchlist/${id}`,
        headers: {
            "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
        },
    }).done(function(response) {

        watchlist_delete_row(id);

        let index = ctx.watchlist.findIndex((obj) => {
            return obj.id == id;
        });
        if (index > -1) {
            // Remove the element
            ctx.watchlist.splice(index, 1);
        } else {
            console.error(`Tried to delete unexistent watchlist object id ${id}`);
        }
        update_map_markers(ctx, dsos_data, ctx.watchlist);

    }).fail(function(xhr, status, error) {
        console.error("watchlist_delete() failed", xhr, status, error);
    });
}

/**
 * Add object to watchlist, both on client and on server
 */
function watchlist_add(ctx, dsos_data, id) {
    // TODO make api call

    // Check if the object already exists
    let index = ctx.watchlist.findIndex((obj) => {
        return obj.id == id;
    });
    if (index > -1) {
        console.error("Element already exists id:", id);
    } else {
        let style = 0;
        let notes = "";

        watchlist_create_row(
            dsos_data,
            id,
            notes,
            style,
            function(id) { watchlist_delete(ctx, dsos_data, id); },
            function(id) { watchlist_save(ctx, id); },
            function(id) { object_goto(ctx, dsos_data, id); }
        ).appendTo("#watchlist-table tbody");

        ctx.watchlist.push({
            id: id,
            notes: notes,
            style: style
        });

        update_map_markers(ctx, dsos_data, ctx.watchlist);
    }
}

/**
 * Save changes on given object id to server
 */
function watchlist_save(ctx, id) {
    $.ajax({
        type: "PUT",
        url: `/api/v1/watchlist/${id}`,
        headers: {
            "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            star_id: id,
            notes: $(`#watchlist-obj-${id} .objects-notes textarea`).val(),
            style: $(`#watchlist-obj-${id} .objects-style select`).val(),
        }),
    }).done(function(response) {
        console.log("watchlist_save() successful");
    }).fail(function(xhr, status, error) {
        console.error("watchlist_save() failed", xhr, status, error);
    });
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
                function(id) { watchlist_save(ctx, id); },
                function(id) { object_goto(ctx, dsos_data, id); }
            ).appendTo("#watchlist-table tbody");
        }
        update_map_markers(ctx, dsos_data, ctx.watchlist);

    }).fail(function(xhr, status, error) {
        console.error("watchlist_get_all() failed", xhr, status, error);
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
 * Determines how the narkers will look on the celestial map
 */
function celestial_redraw() {
    let text_style = {
        fill: "#f0f",
        font: "bold 15px 'Saira Condensed', sans-serif",
        align: "left",
        baseline: "bottom"
    };
    let point_style = {
        stroke: "#ff00ff",
        width: 3,
        fill: "rgba(255, 204, 255, 0.4)"
    };

    Celestial.container.selectAll(`.watchlist-0`).each(function(d) {

        // If point is visible
        if (Celestial.clip(d.geometry.coordinates)) {

            // Get point coordinates
            let pt = Celestial.mapProjection(d.geometry.coordinates);

            let radius = 10;

            Celestial.setStyle(point_style);

            // Draw a circle
            Celestial.context.beginPath();
            Celestial.context.arc(pt[0], pt[1], radius, 0, 2 * Math.PI);
            Celestial.context.closePath();

            Celestial.context.stroke();
            Celestial.context.fill();

            // Draw text
            Celestial.setTextStyle(text_style);
            Celestial.context.fillText(
                d.properties.name, // Text
                pt[0] + radius - 1, // X
                pt[1] - radius + 1 // Y
            );
        }
    });
    Celestial.container.selectAll(`.watchlist-1`).each(function(d) {

        // If point is visible
        if (Celestial.clip(d.geometry.coordinates)) {

            // Get point coordinates
            let pt = Celestial.mapProjection(d.geometry.coordinates);

            let size = 15;

            Celestial.setStyle(point_style);

            // Draw a circle
            Celestial.context.beginPath();

            let hsize = size/2;
            Celestial.context.moveTo(pt[0] - hsize, pt[1] - hsize);
            Celestial.context.lineTo(pt[0] + hsize, pt[1] + hsize);
            Celestial.context.stroke();
            Celestial.context.moveTo(pt[0] - hsize, pt[1] + hsize);
            Celestial.context.lineTo(pt[0] + hsize, pt[1] - hsize);
            Celestial.context.stroke();

            // Draw text
            Celestial.setTextStyle(text_style);
            Celestial.context.fillText(
                d.properties.name, // Text
                pt[0] + size - 1, // X
                pt[1] - size + 1 // Y
            );
        }
    });
}

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

    // Format the array elemts to what Celestial expects
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
                A.source(
                    obj.geometry.coordinates[0],
                    obj.geometry.coordinates[1])
            );
        }
    }
}