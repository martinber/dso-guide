import { config } from "./config.js";

Celestial.display(config);

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
