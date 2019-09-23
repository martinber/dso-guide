"use strict";

$(document).ready(() {

    $("#passchange-form").submit(e =>{
        e.preventDefault();
        refresh_error_text()

        let user = $("#username").val()
        let old_pass = $("#old-password").val()
        let new_pass = $("#new-password").val()
        let new_conf_pass = $("#confirm-new-password").val()

        if (new_conf_pass == new_pass) {
            $.ajax({
                type: "PUT",
                url: "/api/v1/password",
                data: JSON.stringify({username: user, password: old_pass, new_password: new_conf_pass,}),
                contentType: "application/json"
            }).done(response => {
                window.location.replace("/index.html") //TODO send username
            }).fail((xhr, status, error) => {
                console.error("register form sumbit failed", xhr, status, error);
                handle_error(xhr.status)
            });
        }
        else {
            // Only error that has to be checked from client side
            $("#new-password-error-text").text("Passwords do not match")
        }
    });
});


function refresh_error_text() {
    if ( $("#error-text") != null || $("#password-error-text") != null ) {
        $("#error-text").text("")
        $("#password-error-text").text("")
    }
}

function handle_error(status_number) {

    if (status_number == 406) {
        $("#user-error-text").text("Username can only contain letters, numbers and _")
    }
    else if (status_number == 411) {
        $("#new-password-error-text").text("Password must be at least 8 characters long")
    }
    else if (status_number == 500) {
        $("#user-error-text").text("Server Error")
    }
    else if (status_number == 401){
        $("#old-password-error-text").text("Username or password doesn't match")
    }

}
