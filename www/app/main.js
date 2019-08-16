"use strict";

import { config } from "./config.js";
import * as data from "./data.js";

/**
 * List of rows on the watchlist table, including the string that is shown to
 * the user on the table header
 */
const table_rows = [
    { name: "id", string: "ID" },
    { name: "name", string: "Name" },
    { name: "mag", string: "Mag" },
    { name: "type", string: "Type" },
    { name: "ra", string: "RA" },
    { name: "dec", string: "DEC" },
    { name: "alt", string: "ALT" },
    { name: "az", string: "AZ" },
    { name: "notes", string: "Notes" },
    { name: "style", string: "Style" },
    { name: "delete", string: "Delete" },
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
    var td = $("<tr>");
    var select = $("<select>");

    for (var style of object_styles) {
        select.append(
            $("<option>", {
                value: style.name,
                text: style.string,
            })
        );
    }

    td.append(select);
    return td;
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
                        text: `${id}`,
                    }),
                );
                break;

            case "name":
                tr.append(
                    $("<td>", {
                        text: `${data.get_name(dsos_data, id)}`,
                    }),
                );
                break;

            case "mag":
                tr.append(
                    $("<td>", {
                        text: `${data.get_mag(dsos_data, id)}`,
                    }),
                );
                break;

            case "type":
                tr.append(
                    $("<td>", {
                        text: `${data.get_type(dsos_data, id)}`,
                    }),
                );
                break;

            case "ra":
                tr.append(
                    $("<td>", {
                        text: `${data.get_ra(dsos_data, id)}`,
                    }),
                );
                break;

            case "dec":
                tr.append(
                    $("<td>", {
                        text: `${data.get_dec(dsos_data, id)}`,
                    }),
                );
                break;

            case "alt":
                tr.append(
                    $("<td>", {
                        text: `${data.get_alt(dsos_data, id)}`,
                    }),
                );
                break;

            case "az":
                tr.append(
                    $("<td>", {
                        text: `${data.get_az(dsos_data, id)}`,
                    }),
                );
                break;

            case "notes":
                tr.append($("<td>").append(
                    $("<textarea placeholder='Notes....'>", {
                        // TODO: Not working
                        text: "dfhjsdk",
                    })
                ));
                break;

            case "style":
                tr.append($("<td>").append(
                    create_style_cell(style)
                ));
                break;

            case "delete":
                tr.append($("<td>").append(
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

    // Celestial.display(config);

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
