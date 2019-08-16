'use strict';

import { config } from "./config.js";

function get_name(dsos_data, id) {
    return dsos_data.features[id].properties.name;
}

function get_type(dsos_data, id) {
    return dsos_data.features[id].properties.type;
}

function get_mag(dsos_data, id) {
    // TODO
    return dsos_data.features[id].properties.mag;
}

function get_ra(dsos_data, id) {
    return dsos_data.features[id].geometry.coordinates[0];
}

function get_dec(dsos_data, id) {
    return dsos_data.features[id].geometry.coordinates[1];
}

function get_alt(dsos_data, id) {
    return "TODO";
}

function get_az(dsos_data, id) {
    return "TODO";
}

$(document).ready(function() {

    // Celestial.display(config);

    /*
    function button_test() {
        const userAction = async () => {
            const response = await fetch('http://127.0.0.1:5000/api/v1/resources/all');
            const myJson = await response.json();

            const test_text = document.getElementById('test-text');
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
            const test_text = document.getElementById('test-text');
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

        $('<tr>', {
            id: `watch-obj-${id}`,
        }).append(
            $('<td>', {
                text: `${id}`,
            }),
            $('<td>', {
                text: `${get_name(dsos_data, id)}`,
            }),
            $('<td>', {
                text: `${get_ra(dsos_data, id)}`,
            }),
            $('<td>', {
                text: `${get_dec(dsos_data, id)}`,
            }),
            $('<td>', {
                text: `${get_alt(dsos_data, id)}`,
            }),
            $('<td>', {
                text: `${get_az(dsos_data, id)}`,
            }),
            $('<td>').append(
                $('<textarea>')
            ),
            $('<td>').append(
                $('<select>').append(
                    $('<option>', {
                        value: "circle",
                        text: "Circle",
                    }),
                    $('<option>', {
                        value: "square",
                        text: "Square",
                    }),
                    $('<option>', {
                        value: "triangle",
                        text: "Triangle",
                    }),
                ),
            ),
            $('<td>').append(
                $('<button>', {
                    text: "X",
                })
            ),
        ).appendTo("#watch-table tbody");
    });

});
