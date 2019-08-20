"use strict";

// TODO: Remove watchlist_rows
import { watchlist_rows, object_styles } from "./const.js";
import { config } from "./config.js";
import * as data from "./data.js";
import { watchlist_create_row, catalog_create } from "./tables.js";

var aladin;

/**
 * Delete object from watchlist
 *
 * Deletes both on server and on client
 */
function watchlist_delete(id)
{
    $.ajax({
        type: "DELETE",
        url: "/api/v1/watchlist/object" + $.param({ "id": id }),
        dataType: "json",
    }).done(function(dsos_data) {

        $(`#watchlist-obj-${id}`).remove();
        // TODO

    }).fail(function(jqXHR, textStatus, errorThrown) {
        alert("Error " + id);
        $(`#watchlist-obj-${id}`).remove();
        // TODO

    });
}

/**
 * Save changes on given object id to server
 */
function watchlist_save(id)
{
    console.log($(`#watchlist-obj-${id} .objects-notes textarea`).val());
    console.log($(`#watchlist-obj-${id} .objects-style select`).val());
    $.ajax({
        type: "PUT",
        url: "/api/v1/watchlist/object" + $.param({ "id": id }),
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            id: id,
            notes: $(`#watchlist-obj-${id} .objects-notes textarea`).val(),
            style: $(`#watchlist-obj-${id} .objects-style select`).val(),
        }),
        dataType: "json",
    }).done(function(dsos_data) {

        // TODO

    }).fail(function(jqXHR, textStatus, errorThrown) {
        alert("Error " + id);
        // TODO

    });
}


/**
 * Update the objects to show on the maps.
 *
 * Provide a list of objects to show. Most properties are taken directly from
 * the json database.
 * {
 *     "type": "Feature",
 *     "id": 43,
 *     "style": 2,
 *     "properties": {
 *         "name": "NGC 54",
 *         "dim": "1.5x3" // Size in arcminutes
 *     },
 *     "geometry":{
 *         "type": "Point",
 *         "coordinates": [-80.7653, 38.7837]
 *     }
 * }
 */

// TODO: Not working, debug doing modifications to celestial.js
function update_map_datetime(datetime) {
    Celestial.date(datetime);
    Celestial.apply();
    Celestial.display(config);
    console.log(config.geopos);
}

// TODO: Not working, debug doing modifications to celestial.js
function update_map_location(lat, long) {
    config.geopos = [lat, long];
    Celestial.apply(config);
    Celestial.display(config);
    console.log(config.geopos);
}

/**
 * Focus object on aladin map
 *
 * ra and dec must be given on degrees
 * fov is the field of view to set (zoom)
 */
function map_goto(ra, dec, fov) {
    aladin.gotoRaDec(ra, dec);
    aladin.setFov(fov);
    window.location.hash = "aladin-map" // Scroll page to map
}

function update_map_markers(objs) {

    var pointStyle = {
        stroke: "#f0f",
        width: 3,
        fill: "rgba(255, 204, 255, 0.4)"
    };
    var textStyle = {
        fill:"#f0f",
        font: "bold 15px 'Saira Condensed', sans-serif",
        align: "left",
        baseline: "bottom"
    };

    Celestial.add({
        type: "line",
        callback: function(error, json) {
            if (error) return console.warn(error);

            // Load the geoJSON file and transform to correct coordinate
            // system, if necessaryo
            var data = Celestial.getData({
                "type": "FeatureCollection",
                "features": objs,
            }, config.transform);

            // Add to celestial objects container in d3
            Celestial.container.selectAll(".asterisms")
                .data(data.features)
                .enter().append("path")
                .attr("class", "watchlist");
            // Trigger redraw to display changes
            Celestial.redraw();
        },
        redraw: function() {
            // Select the added objects by class name as given previously
            Celestial.container.selectAll(".watchlist").each(function(d) {

                // If point is visible (this doesn't work automatically for points)
                if (Celestial.clip(d.geometry.coordinates)) {
                    // get point coordinates
                    var pt = Celestial.mapProjection(d.geometry.coordinates);
                    // object radius in pixel, could be varable depending on e.g. dimension or magnitude
                    // var r = Math.pow(100 - d.properties.mag, 0.7); // replace 20 with dimmest magnitude in the data
                    var r = 10;

                    // draw on canvas
                    //  Set object styles fill color, line color & width etc.
                    Celestial.setStyle(pointStyle);
                    // Start the drawing path
                    Celestial.context.beginPath();
                    // Thats a circle in html5 canvas
                    Celestial.context.arc(pt[0], pt[1], r, 0, 2 * Math.PI);
                    // Finish the drawing path
                    Celestial.context.closePath();
                    // Draw a line along the path with the prevoiusly set stroke color and line width
                    Celestial.context.stroke();
                    // Fill the object path with the prevoiusly set fill color
                    Celestial.context.fill();

                    // Set text styles
                    Celestial.setTextStyle(textStyle);
                    // and draw text on canvas
                    Celestial.context.fillText(d.properties.name, pt[0] + r - 1, pt[1] - r + 1);
                }
            });
        },
    });

    var catalog = A.catalog({ shape: "circle" });
    aladin.addCatalog(catalog);
    for (var obj of objs) {
        catalog.addSources(A.source(obj.geometry.coordinates[0], obj.geometry.coordinates[1]));
    }
    catalog.addSources(A.source(105.70779763, -8.31350997));
    catalog.addSources(A.source(105.74242906, -8.34776709));

    Celestial.display(config);
    console.log(config.geopos);
}

$(document).ready(function() {

    // TODO
    // $('#datetime-date').val(new Date().toDateInputValue());
    // $('#datetime-time').val(new Date().toDateInputValue());

    // Celestial.display(config);
    aladin = A.aladin('#aladin-map', {
        fov: 1,
        target: 'M31',
        reticleColor: "rgb(0, 0, 0)", // Used on coordinates text
        showReticle: false,
    });

    $("#datetime-submit").click(function(e) {
        e.preventDefault(); // Disable built-in HTML action
        update_map_datetime(new Date(0, 0, 0));
    });

    $("#location-submit").click(function(e) {
        e.preventDefault(); // Disable built-in HTML action
        update_map_location(-33, -63);
    });

    /*
    function button_test() {
        const userAction = async () => {
            const response = await fetch("http://127.0.0.1:5000/api/v1/resources/all");
            const myJson = await response.json();

            const test_text = document.getElementById("test-text");
            test_text.innerHTML = myJson[1].apellido;
        }
        userAction();
    }

    document.getElementById("test-button").addEventListener("click", button_test);
    */

    $("#login-form").submit(function(e) {
        e.preventDefault(); // Disable built-in HTML action
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            data: $(this).serialize(),
            dataType: "json",
        }).done(function(json) {
            test_text.innerHTML = "intentado_loguearse";
        });
    });

    $("#register-form").submit(function(e) {
        e.preventDefault(); // Disable built-in HTML action
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            data: $(this).serialize(),
            dataType: "json",
        }).done(function(json) {
            test_text.innerHTML = "intentado_registrarse";
        });
    });

    $.ajax({
        type: "GET",
        url: "/data/dsos.14.json",
        dataType: "json",
    }).done(function(dsos_data) {

        // TODO: Move to tables.js
        for (var row of watchlist_rows) {

            $("#watchlist-table thead tr").append(
                $("<th>", {
                    text: row.string,
                })
            );
        };

        var ngc104 = data.get_id(dsos_data, "NGC104");
        var m32 = data.get_id(dsos_data, "M32");

        var watchlist = [
            {
                "id": 35,
                "notes": "qwertyuiop",
                "style": 3,
            },
            {
                "id": ngc104,
                "notes": null,
                "style": 4,
            },
            {
                "id": m32,
                "notes": null,
                "style": 2,
            },
            {
                "id": 435,
                "notes": null,
                "style": 2,
            },
            {
                "id": 4035,
                "notes": null,
                "style": 2,
            },
            {
                "id": 534,
                "notes": null,
                "style": 2,
            },
        ]

        var map_objects = [];
        for (var obj of watchlist) {
            watchlist_create_row(dsos_data, obj.id, obj.notes, obj.style).appendTo("#watchlist-table tbody");
            var dim = data.get_dimensions(dsos_data, obj.id);

            map_objects.push({
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
        update_map_markers(map_objects);

        catalog_create(dsos_data, null, [
            {
                id: 534,
                appears_on: ["adfa", "dsfs"],
            },
            {
                id: 33,
                appears_on: ["adfa", "dsfs"],
            },
            {
                id: 64,
                appears_on: ["adfa", "dsfs"],
            },
        ]);

    });

});
