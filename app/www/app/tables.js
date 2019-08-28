/**
 * Tools to manipulate the watchlist and catalog tables
 */

import { watchlist_rows, catalog_rows, object_styles } from "./const.js";
import * as data from "./data.js";

/**
 * Create table cell with object name
 */
function create_name_cell(dsos_data, id) {
    return $("<td>", {
        class: "objects-name",
    }).append(
        $("<span>", {
            text: `${data.get_name(dsos_data, id)}`,
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
            text: `${id}`,
        })
    );
}

/**
 * Create table cell with object magnitude
 */
function create_mag_cell(dsos_data, id) {
    return $("<td>", {
        class: "objects-mag",
    }).append(
        $("<span>", {
            class: "objects-label",
            text: "Mag:",
        }),
        $("<span>", {
            text: `${data.get_mag(dsos_data, id)}`,
        })
    );
}

/**
 * Create table cell with object type
 */
function create_type_cell(dsos_data, id) {
    return $("<td>", {
        class: "objects-type",
        text: `${data.get_type(dsos_data, id)}`,
    });
}

/**
 * Create table cell with object RA and DEC
 */
function create_ra_dec_cell(dsos_data, id) {

    return $("<td>", {
        class: "objects-ra-dec",
    }).append(
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "RA:",
            }),
            $("<span>", {
                text: `${data.get_ra(dsos_data, id)}`,
            })
        ),
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "DEC:",
            }),
            $("<span>", {
                text: `${data.get_dec(dsos_data, id)}`,
            })
        )
    );
}

/**
 * Create table cell with object ALT and AZ
 */
function create_alt_az_cell(dsos_data, id) {

    return $("<td>", {
        class: "objects-alt-az",
    }).append(
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "ALT:",
            }),
            $("<span>", {
                text: `${data.get_alt(dsos_data, id)}`,
            })
        ),
        $("<span>").append(
            $("<span>", {
                class: "objects-label",
                text: "AZ:",
            }),
            $("<span>", {
                text: `${data.get_az(dsos_data, id)}`,
            })
        )
    );
}

/**
 * Create table cell with object ALT and AZ
 */
function create_notes_cell(notes) {

    return $("<td>", {
        class: "objects-notes",
    }).append(
        $("<textarea placeholder='Notes....'>").val(notes)
    );
}

/**
 * Create table cell with style dropdown
 */
function create_style_cell(selected_style) {
    let td = $("<td>", {
        class: "objects-style",
    });

    let select = $("<select>");

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

    for (let row of watchlist_rows) {
        tr.append(
            $("<th>", {
                text: row.string,
            })
        );
    }
}

/**
 * Delete every row
 */
export function watchlist_delete_row_all() {
    $("#watchlist-table tbody").empty();
}

/**
 * Delete table row from id
 */
export function watchlist_delete_row(id) {
    $(`#watchlist-obj-${id}`).remove();
}

/**
 * Create table row from arguments and dsos_data
 *
 * Args:
 * - dsos_data: JSON of object data
 * - id: Object id
 * - notes: String of user notes, can be null
 * - style: Integer id of object style, can be null
 * - delete_callback(id): Called when user clicks the delete button, gives
 *   object id as argument
 * - save_callback(id): Called when user clicks the save button, gives object id
 *   as argument
 * - goto_callback(id): Called when user clicks the goto button, gives object
 *   id as argument
 */
export function watchlist_create_row(
    dsos_data,
    id,
    notes,
    style,
    delete_callback,
    save_callback,
    goto_callback
) {
    let tr =  $("<tr>", {
        id: `watchlist-obj-${id}`,
    });

    for (let row of watchlist_rows) {
        switch (row.name) {
            case "id":
                tr.append(create_id_cell(id));
                break;

            case "name":
                tr.append(create_name_cell(dsos_data, id));
                break;

            case "mag":
                tr.append(create_mag_cell(dsos_data, id));
                break;

            case "type":
                tr.append(create_type_cell(dsos_data, id));
                break;

            case "ra-dec":
                tr.append(create_ra_dec_cell(dsos_data, id));
                break;

            case "alt-az":
                tr.append(create_alt_az_cell(dsos_data, id));
                break;

            case "notes":
                tr.append(create_notes_cell(notes));
                break;

            case "style":
                tr.append(create_style_cell(style));
                break;

            case "controls":
                let dim = data.get_dimensions(dsos_data, id);

                tr.append($("<td>", {
                    class: "objects-controls",
                }).append(
                    $("<button>", {
                        text: "X",
                        click: function() {
                            delete_callback(id);
                        }
                    }),
                    $("<button>", {
                        text: "Save",
                        click: function() {
                            save_callback(id);
                        }
                    }),
                    $("<button>", {
                        text: "GoTo",
                        click: function() {
                            goto_callback(id);
                        },
                    })
                ));
                break;
        }
    }

    return tr;
}

/**
 * Create catalog table
 *
 * Args:
 * - dsos_data: JSON of object data
 * - table: Table where to create the catalog
 * - catalog: Catalog array
 * - ass_callback(id): Called when user clicks the add button, gives object id
 *   as argument
 * - goto_callback(id): Called when user clicks the goto button, gives object
 *   id as argument
 *
 * Catalog array:
 *
 * [
 *     {
 *         id: 32,
 *         appears_on: [
 *             "Binosky",
 *             "Caldwell",
 *         ],
 *     },
 *     {
 *         id: 77,
 *         appears_on: [
 *             "Caldwell",
 *         ],
 *     },
 * ]
 */
export function catalog_create(
    dsos_data,
    table,
    catalog,
    add_callback,
    goto_callback
) {

    // TODO: Stop hardconding #catalog-table
    for (let row of catalog_rows) {

        $("#catalog-table thead tr").append(
            $("<th>", {
                text: row.string,
            })
        );
    };

    for (let object of catalog) {

        let tr =  $("<tr>", {
            id: `watchlist-obj-${object.id}`,
        });

        for (let row of catalog_rows) {
            switch (row.name) {
                case "id":
                    tr.append(create_id_cell(object.id));
                    break;

                case "name":
                    tr.append(create_name_cell(dsos_data, object.id));
                    break

                case "mag":
                    tr.append(create_mag_cell(dsos_data, object.id));
                    break;

                case "type":
                    tr.append(create_type_cell(dsos_data, object.id));
                    break;

                case "ra-dec":
                    tr.append(create_ra_dec_cell(dsos_data, object.id));
                    break;

                case "alt-az":
                    tr.append(create_alt_az_cell(dsos_data, object.id));
                    break;

                case "controls":
                    let dim = data.get_dimensions(dsos_data, object.id);

                    tr.append($("<td>", {
                        class: "objects-controls",
                    }).append(
                        $("<button>", {
                            text: `Add`,
                            click: () => {
                                add_callback(object.id);
                            }
                        }),
                        $("<button>", {
                            text: "GoTo",
                            click: () => {
                                goto_callback(object.id);
                            },
                        })
                    ));
                    break;

                case "appears_on":
                    let td = $("<td>", {
                        class: "objects-appears-on",
                    });
                    let ul = $("<ul>");

                    for (let catalog of object.appears_on) {
                        ul.append(
                            $("<li>", { text: catalog, })
                        );
                    }

                    td.append(ul);
                    tr.append(td);
                    break;
            }
        }

        tr.appendTo("#catalog-table tbody");
    }
}
