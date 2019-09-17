/**
 * Helper functions to manipulate the watchlist and catalog tables
 */

import { watchlist_columns, catalog_columns, object_styles } from "./const.js";

/**
 * Create table cell with object name
 */
function create_name_cell(name) {
    return $("<td>", {
        class: "objects-name",
    }).append(
        $("<span>", {
            text: name,
        })
    );
}

/**
 * Create table cell with object id
 */
function create_id_cell(id) {
    return $("<td>", {
        class: "objects-id",
    }).append(
        $("<span>", {
            class: "objects-label",
            text: "ID:",
        }),
        $("<span>", {
            text: String(id),
        })
    );
}

/**
 * Create table cell with object magnitude
 */
function create_mag_cell(mag) {
    return $("<td>", {
        class: "objects-mag",
    }).append(
        $("<span>", {
            class: "objects-label",
            text: "Mag:",
        }),
        $("<span>", {
            text: String(mag),
        })
    );
}

/**
 * Create table cell with object type
 */
function create_type_cell(type) {

    return $("<td>", {
        class: "objects-type",
        text: type,
    });
}

/**
 * Create table cell with object RA and DEC
 */
function create_ra_dec_cell(ra_dec) {

    return $("<td>", {
        class: "objects-ra-dec",
    }).append(
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "RA:",
            }),
            $("<span>", {
                text: String(ra_dec[0]),
            })
        ),
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "DEC:",
            }),
            $("<span>", {
                text: String(ra_dec[1]),
            })
        )
    );
}

/**
 * Create table cell with object ALT and AZ
 */
function create_alt_az_cell(alt_az) {

    return $("<td>", {
        class: "objects-alt-az",
    }).append(
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "ALT:",
            }),
            $("<span>", {
                text: String(alt_az[0]),
            })
        ),
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "AZ:",
            }),
            $("<span>", {
                text: String(alt_az[1]),
            })
        )
    );
}

/**
 * Create table cell with object notes
 */
function create_notes_cell(notes, watch_dso, notes_change_callback) {

    return $("<td>", {
        class: "objects-notes",
    }).append(
        $("<textarea placeholder='Notes....'>").val(notes)
            .keyup(() => notes_change_callback(watch_dso))
            .change(() => notes_change_callback(watch_dso))
    );
}


/**
 * Create table cell with style dropdown
 *
 * selected_style must be an integer
 */
function create_style_cell(selected_style, watch_dso, style_change_callback) {
    let td = $("<td>", {
        class: "objects-style",
    });

    /**
     * Get the integer that represents a style by its name
     *
     * If the given name could not be found returns -1
     */
    function get_style_id(style_name) {
        for (let i = 0; i < object_styles.length; i++) {
            if (object_styles[i].name == style_name) {
                return i;
            }
        }
        return -1;
    }

    let select = $("<select>");
    select.change(() => {
        style_change_callback(watch_dso, get_style_id($(this).val()));
    });

    for (let i = 0; i < object_styles.length; i++) {

        if (i == selected_style) {
            select.append(
                $("<option>", {
                    value: object_styles[i].name,
                    text: object_styles[i].string,
                    selected: true,
                })
            );
        } else {
            select.append(
                $("<option>", {
                    value: object_styles[i].name,
                    text: object_styles[i].string,
                })
            );
        }
    }

    td.append(select);

    return td;
}

/**
 * Create watchlist header
 *
 * Give as an argument the already created "table thead tr"
 */
export function watchlist_create_header(tr) {

    for (let row of watchlist_columns) {
        tr.append(
            $("<th>", {
                text: row.string,
            })
        );
    }
}

/**
 * Create catalog header
 *
 * Give as an argument the already created "table thead tr"
 */
export function catalog_create_header(tr) {

    for (let row of catalog_columns) {
        tr.append(
            $("<th>", {
                text: row.string,
            })
        );
    }
}

/**
 * Delete every row on watchlist table
 */
export function watchlist_delete_row_all() {
    $("#watchlist-table tbody").empty();
}

/**
 * Create watchlist table row
 *
 * Args:
 * - watch_dso: WatchDso object
 * - delete_callback(watch_dso): Called when user clicks the delete button,
 *   gives watch_dso as argument
 * - save_callback(watch_dso): Called when user clicks the save button, gives
 *   watch_dso as argument
 * - goto_callback(watch_dso): Called when user clicks the goto button, gives
 *   watch_dso as argument
 * - style_change_callback(watch_dso, style): Called when user changes the style
 *   using the dropdown, gives as an argument the watch_dso and the new style
 * - notes_change_callback(watch_dso): Called when user does something on the
 *   notes, gives watch_dso as argument
 */
export function watchlist_create_row(
    watch_dso,
    delete_callback,
    save_callback,
    goto_callback,
    style_change_callback,
    notes_change_callback
) {
    let tr =  $("<tr>");
    for (let col of watchlist_columns) {
        switch (col.name) {
            case "id":
                tr.append(create_id_cell(watch_dso.dso.id));
                break;

            case "name":
                tr.append(create_name_cell(watch_dso.dso.name));
                break;

            case "mag":
                tr.append(create_mag_cell(watch_dso.dso.mag));
                break;

            case "type":
                tr.append(create_type_cell(watch_dso.dso.type.long_name));
                break;

            case "ra-dec":
                tr.append(create_ra_dec_cell(watch_dso.dso.coords));
                break;

            case "alt-az":
                tr.append(create_alt_az_cell([0, 0]));
                break;

            case "notes":
                tr.append(create_notes_cell(watch_dso.notes, watch_dso, notes_change_callback));
                break;

            case "style":
                tr.append(create_style_cell(watch_dso.style, watch_dso, style_change_callback));
                break;

            case "controls":
                tr.append($("<td>", {
                    class: "objects-controls",
                }).append(
                    $("<button>", {
                        text: "X",
                        class: "objects-delete",
                        click: () => delete_callback(watch_dso)
                    }),
                    $("<button>", {
                        text: "Save",
                        disabled: true,
                        class: "objects-save",
                        click: () => save_callback(watch_dso)
                    }),
                    $("<button>", {
                        text: "GoTo",
                        class: "objects-goto",
                        click: () => goto_callback(watch_dso)
                    })
                ));
                break;
        }
    }

    return tr;
}

/**
 * Create catalog table row
 *
 * Args:
 * - dso: Dso object
 * - add_callback(dso): Called when user clicks the add button, gives dso as
 *   argument
 * - goto_callback(dso): Called when user clicks the goto button, gives dso as
 *   argument
 */
export function catalog_create_row(
    dso,
    add_callback,
    goto_callback,
) {
    let tr =  $("<tr>");
    for (let col of catalog_columns) {
        switch (col.name) {
            case "id":
                tr.append(create_id_cell(dso.id));
                break;

            case "name":
                tr.append(create_name_cell(dso.name));
                break;

            case "mag":
                tr.append(create_mag_cell(dso.mag));
                break;

            case "type":
                tr.append(create_type_cell(dso.type.long_name));
                break;

            case "ra-dec":
                tr.append(create_ra_dec_cell(dso.coords));
                break;

            case "alt-az":
                tr.append(create_alt_az_cell([0, 0]));
                break;

            case "controls":
                tr.append($("<td>", {
                    class: "objects-controls",
                }).append(
                    $("<button>", {
                        text: `Add`,
                        click: () => {
                            add_callback(dso);
                        }
                    }),
                    $("<button>", {
                        text: "GoTo",
                        click: () => {
                            goto_callback(dso);
                        },
                    })
                ));
                break;

            case "appears_on":
                let td = $("<td>", {
                    class: "objects-appears-on",
                });
                let ul = $("<ul>");

                for (let catalog of dso.appears_on) {
                    ul.append(
                        $("<li>", { text: catalog, })
                    );
                }

                td.append(ul);
                tr.append(td);
                break;
        }
    }

    return tr;
}
