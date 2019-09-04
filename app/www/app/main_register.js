"use strict";

$(document).ready(function() {
    $("#register-form").submit(function(e) {
        e.preventDefault(); // Disable built-in HTML action

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
                console.log("intentado_registrarse");
                // TODO
            }).fail(function(xhr, status, error) {
                console.error("register form sumbit failed", xhr, status, error);
            });
        }
        else {
            console.log("Passwords don't match")
        }
    });

});
