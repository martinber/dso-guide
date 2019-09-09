"use strict";

$(document).ready(function() {
    $("#register-form").submit(function(e) {
        e.preventDefault(); // Disable built-in HTML action

        refresh_error_text()

        let user = $("#register-username").val();
        let pass = $("#register-password").val();
        let confirmed_pass = $("#confirm-password").val();

        if ( pass == confirmed_pass ) {
            $.ajax({
                type: "POST",
                url: "/api/v1/users",
                data: JSON.stringify({username: user, password: pass,}),
                contentType: "application/json",
            }).done(function(response) {
                window.location.replace("/index.html") //TODO send username
            }).fail(function(xhr, status, error) {
                console.error("register form sumbit failed", xhr, status, error);
                CustomErrorHandler(xhr.status)
            });
        }
        else {
            // Only error that has to be checked from client side
            $("#password-error-text").text("Passwords do not match")
        }

    });

});

function refresh_error_text() {
    if ( $("#error-text") != null || $("#password-error-text") != null ) {
        $("#error-text").text("")
        $("#password-error-text").text("")
    }
}

function CustomErrorHandler(status_number) {

    if (status_number == 406) {
        $("#error-text").text("Username can only contain letters, numbers and _")
    }
    else if (status_number == 411) {
        $("#password-error-text").text("Password must be at least 8 characters long")
    }
    else if (status_number == 500) {
        $("#error-text").text("Username already exists")
    }

}
