/**
 * DOM tables manager for Watchlist and Catalog
 */

import { watchlist_columns, catalog_columns, object_styles } from "./const.js";

let MAX_ROWS = 100;

/**
 * Manages the Watchlist and Catalog tables
 *
 * - add_callback(dso): Called when user clicks the add button, gives dso as
 *   argument
 * - delete_callback(watch_dso): Called when user clicks the delete button,
 *   gives watch_dso as argument
 * - save_callback(watch_dso): Called when user clicks the save button, gives
 *   watch_dso as argument
 * - goto_callback(dso): Called when user clicks the goto button, gives dso as
 *   argument
 * - style_change_callback(watch_dso, style): Called when user changes the style
 *   using the dropdown, gives as an argument the watch_dso and the new style
 * - notes_change_callback(watch_dso): Called when user does something on the
 *   notes, gives watch_dso as argument
 */
export function TableManager(
    dso_manager,
    add_callback,
    delete_callback,
    save_callback,
    goto_callback,
    style_change_callback,
    notes_change_callback
) {

    this._dso_manager = dso_manager;

    // Table filters toggle

    let make_toggle = (button, collapse) => {
        button.click(e => {
            if (collapse.css("visibility") == "hidden") {
                collapse.css("visibility", "visible");
                collapse.css("display", "block");
            } else {
                collapse.css("visibility", "hidden");
                collapse.css("display", "none");
            }
        });
    }

    make_toggle($("#watchlist-filter-toggle"), $("#watchlist-filter-collapse"));
    make_toggle($("#catalog-filter-toggle"), $("#catalog-filter-collapse"));

    // Watchlist filters

    /*
    $("#watchlist-filter").submit(e => {
        e.preventDefault(); // Disable built-in HTML action

        ui_watchlist_filter(ctx);
    });
    */

    // Catalog filters

    // TODO: Move
    /*
    {
        let fieldset = $("#catalog-filter-appears-on-fieldset");

        let catalogs = [];
        for (let dso of ctx.manager.get_catalog()) {
            for (let catalog of dso.appears_on) {
                if (!catalogs.includes(catalog)) {
                    catalogs.push(catalog);
                }
            }
        }
        for (let catalog of catalogs) {
            fieldset.append(
                $("<div>").append(
                    $("<input>", {
                        type: "checkbox",
                        checked: true,
                        name: catalog,
                        id: `catalog-filter-catalog-${catalog}`
                    }),
                    $("<label>", {
                        for: `catalog-filter-catalog-${catalog}`,
                        text: `${catalog}`,
                    })
                )
            );
        }
        fieldset.append(
            $("<div>").append(
                $("<input>", {
                    type: "checkbox",
                    checked: false,
                    name: "Unlisted",
                    id: `catalog-filter-catalog-unlisted`
                }),
                $("<label>", {
                    for: `catalog-filter-catalog-unlisted`,
                    text: "Unlisted (unpopular DSOs)",
                })
            )
        );
    }

    $("#catalog-filter").submit(e => {
        e.preventDefault(); // Disable built-in HTML action

        // ctx.manager.catalog_set_sort(sort.name);
        // ctx.manager.catalog_set_filter(dso => dso.appears_on.length > 0);
        // ctx.manager.catalog_set_filter(dso => dso.mag < 2);
        let search_string = $("#catalog-filter-search").val();

        let selected_catalogs = [];
        $("#catalog-filter-appears-on-fieldset input").each(function() {
            if (this.checked) {
                selected_catalogs.push(this.name);
            }
        });

        // True or false if we are filtering or not
        let filtering_catalogs = selected_catalogs.length > 0 && !selected_catalogs.includes("Unlisted");
        let filtering_search = search_string.length > 0

        console.log(filtering_catalogs, filtering_search, selected_catalogs, search_string);

        ctx.manager.catalog_set_filter(dso => {
            if (filtering_catalogs) {
                if (!selected_catalogs.some(
                        catalog => dso.appears_on.includes(catalog))) {
                    // The dso does not appear on any of the selected catalogs
                    return false;
                }
            }

            if (filtering_search) {
                if (!dso.name.includes(search_string)) {
                    return false;
                }
            }
            return true;
        });

        catalog_delete_row_all();

        let results = ctx.manager.get_catalog_view();

        if (results.length != 0) {
            for (let dso of ctx.manager.get_catalog_view()) {
                ui_catalog_table_insert(ctx, dso);
            }
        } else {
            $("#catalog-table tbody").append(
                $("<tr>").append(
                    $("<td>", {
                        colspan: "99",
                        text: `Your search gave no results, check your filter \
                               settings too`
                    })
                )
            );
        }
    });
    */

    // Initialize tables

    watchlist_create_header($("#watchlist-table thead tr"));

    $("#watchlist-table tbody").append(
        $("<tr>").append(
            $("<td>", {
                colspan: "99",
                text: `Nothing here, add some objects from the catalog below \
                       or check your filters above.`
            })
        )
    );

    catalog_create_header($("#catalog-table thead tr"));

    // ctx.manager.catalog_set_sort(sort.name);
    // ctx.manager.catalog_set_filter(dso => dso.appears_on.length > 0);
    // ctx.manager.catalog_set_filter(dso => dso.mag < 2);

    catalog_update(this._dso_manager.get_catalog_view(), add_callback, goto_callback);

    /**
     * Add object to watchlist table
     */
    this.watchlist_add = function(watch_dso) {
        // TODO
        this.watchlist_update();
    }

    /**
     * Remove object from watchlist table
     */
    this.watchlist_remove = function(watch_dso) {
        // TODO
        this.watchlist_update();
    }

    /**
     * Update the watchlist table
     */
    this.watchlist_update = function() {

        $("#watchlist-table tbody").empty();

        watchlist_update(
            this._dso_manager.get_watchlist_view(),
            delete_callback,
            save_callback,
            goto_callback,
            style_change_callback,
            notes_change_callback
        );
    }

    /**
     * Mark object as unsaved, e.g. enable save button
     */
    this.watchlist_set_unsaved = function(watch_dso) {
        // Enable the save button
        let tr = watch_dso.get_watchlist_tr();
        tr.find(".objects-save").prop("disabled", false);
    }

    /**
     * Mark object as saved, e.g. disable save button
     */
    this.watchlist_set_saved = function(watch_dso) {
        // Disable the save button
        let tr = watch_dso.get_watchlist_tr();
        tr.find(".objects-save").prop("disabled", true);
    }
}

function watchlist_update(
    watchlist_view,
    delete_callback,
    save_callback,
    goto_callback,
    style_change_callback,
    notes_change_callback
) {
    let page = 1;
    let start = (page - 1) * MAX_ROWS;
    let end = Math.min(page * MAX_ROWS, watchlist_view.length);

    let tbody = $("#watchlist-table tbody");
    tbody.empty();

    for (let i = start; i < end; i++) {
        let watch_dso = watchlist_view[i];

        let tr = watchlist_create_row(
            watch_dso,
            delete_callback,
            save_callback,
            goto_callback,
            style_change_callback,
            notes_change_callback
        );

        watch_dso.set_watchlist_tr(tr);
        tbody.append(tr);
    }
}

function catalog_update(catalog_view, add_callback, goto_callback) {
    let page = 1;
    let start = (page - 1) * MAX_ROWS;
    let end = Math.min(page * MAX_ROWS, catalog_view.length);

    let tbody = $("#catalog-table tbody");
    tbody.empty();

    for (let i = start; i < end; i++) {
        let dso = catalog_view[i];

        let tr = catalog_create_row(dso, add_callback, goto_callback);

        dso.set_catalog_tr(tr);
        tbody.append(tr);
    }
}


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
        $("<textarea placeholder='Notes....'>")
            .val(notes)
            .keyup(() => {
                let tr = watch_dso.get_watchlist_tr();
                notes_change_callback(watch_dso,
                    tr.find(".objects-notes textarea").val());
            })
            .change(() => {
                let tr = watch_dso.get_watchlist_tr();
                notes_change_callback(watch_dso,
                    tr.find(".objects-notes textarea").val());
            })
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
    select.change(function() {
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
function watchlist_create_header(tr) {

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
function catalog_create_header(tr) {

    for (let row of catalog_columns) {
        tr.append(
            $("<th>", {
                text: row.string,
            })
        );
    }
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
 * - goto_callback(dso): Called when user clicks the goto button, gives
 *   watch_dso as argument
 * - style_change_callback(watch_dso, style): Called when user changes the style
 *   using the dropdown, gives as an argument the watch_dso and the new style
 * - notes_change_callback(watch_dso): Called when user does something on the
 *   notes, gives watch_dso as argument
 */
function watchlist_create_row(
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
                        click: () => goto_callback(watch_dso.dso)
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
function catalog_create_row(
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
