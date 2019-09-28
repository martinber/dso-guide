/**
 * Things related to the time vs height plots
 */

export function draw_day_plot(canvas, dso) {
    let ctx = canvas.getContext("2d", { alpha: false} );

    let w = canvas.scrollWidth;
    let h = canvas.scrollHeight;
    canvas.width = w;
    canvas.height = h;

    let threshold_alt = 15.0;

    let color_bg = "#444444";
    let color_grid = "#383838";
    let color_alt_line = "#664444";
    let color_plot = "#886666";
    // let color_grid = "#FFFFFF";

    // Draw background

    ctx.fillStyle = color_bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = color_grid;
    ctx.lineCap = "butt";
    ctx.lineCap = "miter";
    ctx.lineWidth = 1;
    for (let alt of [22.5, 45, 67.5]) { // Lines for 22.5°, 45° and 67.5°
        // Plus 0.5 to have crisp lines of width 1
        let height_px = Math.round(alt_to_px(alt, h) - 0.5) + 0.5;

        ctx.beginPath();
        ctx.moveTo(0, height_px);
        ctx.lineTo(w, height_px);
        ctx.stroke();
    }

    ctx.strokeStyle = color_alt_line;
    ctx.lineCap = "butt";
    ctx.lineCap = "miter";
    ctx.lineWidth = 1;
    let height_px = Math.round(alt_to_px(threshold_alt, h) - 0.5) + 0.5;

    ctx.beginPath();
    ctx.moveTo(0, height_px);
    ctx.lineTo(w, height_px);
    ctx.stroke();

    // Draw plot

    ctx.strokeStyle = color_plot;
    ctx.lineCap = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 3;

    ctx.beginPath();
    for (let hs = 0; hs <= 24; hs++) {
        let date = new Date(2019, 9 - 1, 28, hs, 0);
        ctx.lineTo(hs / 24 * w, alt_to_px(dso.get_alt_az(date, [0, 0])[0], h));
        // console.log(alt_to_px(dso.get_alt_az(date, [0, 0])[0]), h);
    }
    ctx.stroke();
}

function deg_to_fraction(deg) {
    return deg / 90;
}

/**
 * Map altitude in degrees to height in pixels on the canvas
 *
 * 0 degrees maps to the bottom of the canvas, 90 degrees to the top
 */
function alt_to_px(alt, canvas_height) {
    return canvas_height - (alt / 90 * canvas_height);
}
