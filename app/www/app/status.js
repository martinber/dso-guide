/**
 * Returns true if the status banner is visible
 */
export function status_is_visible() {
    return $("#status-banner").css("visibility") != "hidden";
}

/**
 * Show status banner
 */
export function status_show() {
    $("#status-banner").css("visibility", "visible");
    $("#status-banner").css("transform", "translateY(0)");
    let status_banner_height = $("#status-banner").css("height");
    $("body").css("margin-bottom", status_banner_height);
}

/**
 * Show status banner
 */
export function status_hide() {
    $("#status-banner").css("visibility", "hidden");
    $("#status-banner").css("transform", "translateY(100%)");
    $("body").css("margin-bottom", "0");
}

/**
 * Set status text
 *
 * As an argument give valid HTML string
 */
export function status_text(html) {
    $("#status-text").html(html);
}
