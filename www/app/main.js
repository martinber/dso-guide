"use strict";

import { config } from "./config.js";
import * as data from "./data.js";

var aladin;

/**
 * List of rows on a table, including the string that is shown to the user on
 * the table header
 */
const table_rows = [
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
 * Available styles for object highlighting. Each one has an integer ID
 * represented by the index on this table.
 */
const object_styles = [
    { name: "circle", string: "Circle" },
    { name: "square", string: "Square" },
    { name: "triangle", string: "Triangle" },
];

/**
 * Create table cell with style dropdown.
 */
function create_style_cell(style) {
    var select = $("<select>");

    for (var style of object_styles) {
        select.append(
            $("<option>", {
                value: style.name,
                text: style.string,
            })
        );
    }

    return select;
}

/**
 * Create table row from arguments and dsos_data
 *
 * Args:
 * - dsos_data: JSON of object data
 * - id: Object id
 * - notes: String of user notes, can be null
 * - style: Integer id of object style, can be null
 */
function create_row(dsos_data, id, notes, style) {
    var tr =  $("<tr>", {
        id: `objects-obj-${id}`,
    });

    for (var row of table_rows) {
        switch (row.name) {
            case "id":
                tr.append(
                    $("<td>", {
                        class: "objects-id",
                    }).append(
                        $("<span>", {
                            class: "objects-label",
                            text: "ID:",
                        }),
                        $("<span>", {
                            text: `${id}`,
                        }),
                    ),
                );
                break;

            case "name":
                tr.append(
                    $("<td>", {
                        class: "objects-name",
                        text: `${data.get_name(dsos_data, id)}`,
                    }),
                );
                break;

            case "mag":
                tr.append(
                    $("<td>", {
                        class: "objects-mag",
                    }).append(
                        $("<span>", {
                            class: "objects-label",
                            text: "Mag:",
                        }),
                        $("<span>", {
                            text: `${data.get_mag(dsos_data, id)}`,
                        }),
                    ),
                );
                break;

            case "type":
                tr.append(
                    $("<td>", {
                        class: "objects-type",
                        text: `${data.get_type(dsos_data, id)}`,
                    }),
                );
                break;

            case "ra-dec":
                tr.append(
                    $("<td>", {
                        class: "objects-ra-dec",
                    }).append(
                        $("<span>").append(
                            $("<span>", {
                                class: "objects-label",
                                text: "RA:",
                            }),
                            $("<span>", {
                                text: `${data.get_ra(dsos_data, id)}`,
                            }),
                        ),
                        $("<span>").append(
                            $("<span>", {
                                class: "objects-label",
                                text: "DEC:",
                            }),
                            $("<span>", {
                                text: `${data.get_dec(dsos_data, id)}`,
                            }),
                        ),
                    ),
                );
                break;

            case "alt-az":
                tr.append(
                    $("<td>", {
                        class: "objects-alt-az",
                    }).append(
                        $("<span>").append(
                            $("<span>", {
                                class: "objects-label",
                                text: "ALT:",
                            }),
                            $("<span>", {
                                text: `${data.get_alt(dsos_data, id)}`,
                            }),
                        ),
                        $("<span>").append(
                            $("<span>", {
                                class: "objects-label",
                                text: "AZ:",
                            }),
                            $("<span>", {
                                text: `${data.get_az(dsos_data, id)}`,
                            }),
                        ),
                    ),
                );
                break;

            case "notes":
                tr.append($("<td>", {
                    class: "objects-notes",
                }).append(
                    $("<textarea placeholder='Notes....'>").val(notes)
                ));
                break;

            case "style":
                tr.append($("<td>", {
                    class: "objects-style",
                }).append(
                    create_style_cell(style)
                ));
                break;

            case "controls":
                tr.append($("<td>", {
                    class: "objects-controls",
                }).append(
                    $("<button>", {
                        text: "X",
                    })
                ));
                break;
        }
    }

    return tr;
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
    aladin = A.aladin('#aladin-map', {fov:1, target: 'M32'})

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

    $("#test-button").click(function() {
        $.ajax({
            type: "GET",
            url: "https://baconipsum.com/api/?type=meat-and-filler",
            dataType: "json",
        }).done(function(json) {
            const test_text = document.getElementById("test-text");
            test_text.innerHTML = json[1];
        });
    });

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

        for (var row of table_rows) {

            $(".objects-table thead tr").append(
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
            create_row(dsos_data, obj.id, obj.notes, obj.style).appendTo("#watch-table tbody");
            map_objects.push({
                "type": "Feature",
                "id": obj.id,
                "style": obj.style,
                "properties": {
                    "name": data.get_name(dsos_data, obj.id),
                    "dim": data.get_dim(dsos_data, obj.id),
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

        create_row(dsos_data, 1, null, 3).appendTo("#catalog-table tbody");
        create_row(dsos_data, 33, null, 3).appendTo("#catalog-table tbody");
        create_row(dsos_data, 545, null, 3).appendTo("#catalog-table tbody");

    });

});
