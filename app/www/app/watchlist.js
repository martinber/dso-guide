/**
 * Functions to manage the watchlist both on client and on server
 */

/**
 * Delete object from watchlist
 *
 * Deletes both on server and on client
 */
export function watchlist_delete(id) {
    $.ajax({
        type: "DELETE",
        url: "/api/v1/watchlist/object" + $.param({ "id": id }),
        dataType: "json",
    }).done(function(dsos_data) {

        $(`#watchlist-obj-${id}`).remove();
        // TODO

    }).fail(function(xhr, status, error) {
        console.error("watchlist_delete() failed", xhr, status, error);
    });
}

/**
 * Add object to watchlist, both on client and on server
 */
export function watchlist_add(ctx, dsos_data, id) {
    // TODO

    let style = 0;
    let notes = "";

    watchlist_create_row(
        dsos_data,
        id,
        notes,
        style,
        watchlist_delete,
        watchlist_save,
        function(id) { object_goto(ctx, dsos_data, id) },
    ).appendTo("#watchlist-table tbody");
}

/**
 * Save changes on given object id to server
 */
export function watchlist_save(id) {
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

    }).fail(function(xhr, status, error) {
        console.error("watchlist_save() failed", xhr, status, error);
    });
}

/**
 * Replace client watchlist with watchlist from server
 */
export function watchlist_get_all(ctx) {
    $.ajax({
        type: "GET",
        url: "/api/v1/watchlist",
        headers: {
            "Authorization": "Basic " + btoa(ctx.username + ":" + ctx.password)
        },
        dataType: "json",
    }).done(function(json) {
        ctx.watchlist = json;

    }).fail(function(xhr, status, error) {
        console.error("watchlist_get_all() failed", xhr, status, error);
    });
}

