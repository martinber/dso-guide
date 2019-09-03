/**
 * Returns true if the status banner is visible
 */
export function status_is_visible() {
    return $("#info-banner").css("visibility") != "hidden";
}

/**
 * Show status banner
 */
export function status_show() {
    $("#info-banner").css("visibility", "visible");
    $("#info-banner").css("transform", "translateY(0)");
    let info_banner_height = $("#info-banner").css("height");
    $("body").css("margin-bottom", info_banner_height);
}

/**
 * Show status banner
 */
export function status_hide() {
    $("#info-banner").css("visibility", "hidden");
    $("#info-banner").css("transform", "translateY(100%)");
    $("body").css("margin-bottom", "0");
}

/**
 * Set status text
 *
 * As an argument give valid HTML string
 */
export function status_text(html) {
    $("#info-text").html(html);
}
