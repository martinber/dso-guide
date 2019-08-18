"use strict";

import { config } from "./config.js";
import * as data from "./data.js";

/**
 * List of rows on the watchlist table, including the string that is shown to
 * the user on the table header
 */
const table_rows = [
    { name: "name", string: "Name" },
    { name: "id", string: "ID" },
    { name: "mag", string: "Mag" },
    { name: "type", string: "Type" },
    { name: "ra-dec", string: "RA/DEC" },
    { name: "alt-az", string: "ALT/AZ" },
    { name: "style", string: "Style" },
    { name: "delete", string: "Delete" },
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
        id: `watch-obj-${id}`,
    });

    for (var row of table_rows) {
        switch (row.name) {
            case "id":
                tr.append(
                    $("<td>", {
                        class: "watch-id",
                    }).append(
                        $("<span>", {
                            class: "watch-label",
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
                        class: "watch-name",
                        text: `${data.get_name(dsos_data, id)}`,
                    }),
                );
                break;

            case "mag":
                tr.append(
                    $("<td>", {
                        class: "watch-mag",
                    }).append(
                        $("<span>", {
                            class: "watch-label",
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
                        class: "watch-type",
                        text: `${data.get_type(dsos_data, id)}`,
                    }),
                );
                break;

            case "ra-dec":
                tr.append(
                    $("<td>", {
                        class: "watch-ra-dec",
                    }).append(
                        $("<span>").append(
                            $("<span>", {
                                class: "watch-label",
                                text: "RA:",
                            }),
                            $("<span>", {
                                text: `${data.get_ra(dsos_data, id)}`,
                            }),
                        ),
                        $("<span>").append(
                            $("<span>", {
                                class: "watch-label",
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
                        class: "watch-alt-az",
                    }).append(
                        $("<span>").append(
                            $("<span>", {
                                class: "watch-label",
                                text: "ALT:",
                            }),
                            $("<span>", {
                                text: `${data.get_alt(dsos_data, id)}`,
                            }),
                        ),
                        $("<span>").append(
                            $("<span>", {
                                class: "watch-label",
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
                    class: "watch-notes",
                }).append(
                    $("<textarea placeholder='Notes....'>", {
                        // TODO: Not working
                        text: "dfhjsdk",
                    })
                ));
                break;

            case "style":
                tr.append($("<td>", {
                    class: "watch-style",
                }).append(
                    create_style_cell(style)
                ));
                break;

            case "delete":
                tr.append($("<td>", {
                    class: "watch-delete",
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

$(document).ready(function() {

    Celestial.display(config);
    var aladin = A.aladin('#aladin-map', {fov:1, target: 'M81'})

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

        // $("#watch-obj-1").children("td").eq(2).text("HOLA!");

        var id = 67;

        for (var row of table_rows) {

            $("#watch-table thead tr").append(
                $("<th>", {
                    text: row.string,
                })
            );
        };

        create_row(dsos_data, 32, "asdjh", 3).appendTo("#watch-table tbody");
        create_row(dsos_data, 39, "asdjh", 3).appendTo("#watch-table tbody");
        create_row(dsos_data, 38, "asdjh", 3).appendTo("#watch-table tbody");
    });

});
