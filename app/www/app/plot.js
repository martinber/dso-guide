/**
 * Things related to the time vs height plots
 */

import {
    eq_to_geo,
    deg_to_hms,
    fractional_hours,
    calculate_rise_set
} from "./tools.js";

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
    ctx.lineJoin = "miter";
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
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    let height_px = Math.round(alt_to_px(threshold_alt, h) - 0.5) + 0.5;

    ctx.beginPath();
    ctx.moveTo(0, height_px);
    ctx.lineTo(w, height_px);
    ctx.stroke();

    // Draw plot

    ctx.strokeStyle = color_plot;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;

    ctx.beginPath();
    for (let hs = 0; hs <= 24; hs++) {
        let date = new Date(2019, 9 - 1, 28, hs, 0);
        ctx.lineTo(hs / 24 * w, alt_to_px(dso.get_alt_az(date, [0, 0])[0], h));
        // console.log(alt_to_px(dso.get_alt_az(date, [0, 0])[0]), h);
    }
    ctx.stroke();
}

export function draw_visibility_plot(
    canvas,
    dso,
    lat_lon,
    sun_times,
    threshold_alt
) {
    let ctx = canvas.getContext("2d", { alpha: false} );

    let w = canvas.scrollWidth;
    let h = canvas.scrollHeight;
    canvas.width = w;
    canvas.height = h;

    let color_day = "#2b3840";
    let color_night = "#222222";
    let color_visible = "#88666694";
    let color_grid = "#00000085";

    let width_grid = 2;

    // Draw background

    ctx.fillStyle = color_night;
    ctx.fillRect(0, 0, w, h);

    // Clone arrays and add January again to draw it on the far side of the plot
    // too
    sun_times = sun_times.slice();
    sun_times.push(sun_times[0]);

    // Calculate span of the plot

    let min_time = 24; // Minimum time to show, just before the earliest sunset
    let max_time = 0; // Minimum time to show, just after the latest sunset
    for (let i = 0; i < sun_times.length; i++) {
        if (sun_times[i].type != "normal") {
            // The sun is always over or below the horizon
            min_time = 0;
            max_time = 24;
        } else {
            min_time = Math.min(min_time, sun_times[i].set.getHours());
            max_time = Math.max(max_time, sun_times[i].rise.getHours());
        }
    }
    min_time = Math.max(0, min_time - 1); // Add a margin if possible
    max_time = Math.min(24, max_time + 1);
    min_time = 0;
    max_time = 24;
    // let hour_span = 24 - min_time + max_time;
    let hour_span = 24;
    let px_per_min = (h / hour_span) / 60;
    let px_per_month = w / 12;

    // Draw day

    ctx.fillStyle = color_day;
    for (let i = 0; i < sun_times.length; i++) {
        let sun_time = sun_times[i];
        let rise_hs;
        let rise_min;
        let set_hs;
        let set_min;
        switch (sun_time.type) {
            case "normal":
                rise_hs = sun_time.rise.getHours();
                rise_min = sun_time.rise.getMinutes();
                set_hs = sun_time.set.getHours();
                set_min = sun_time.set.getMinutes();
                break;

            case "above":
                rise_hs = 0;
                rise_min = 0;
                set_hs = 23;
                set_min = 60;
                break;

            case "below":
                rise_hs = 23;
                rise_min = 60;
                set_hs = 0;
                set_min = 0;
                break;
        }
        if (rise_hs * 60 + rise_min < set_hs * 60 + set_min) {

            let y = ((rise_hs) * 60 + rise_min) * px_per_min;
            let height = ((set_hs) * 60 + set_min) * px_per_min - y;
            ctx.fillRect(i * px_per_month, y, px_per_month, height);


        } else {
            let y = 0;
            let height = ((set_hs) * 60 + set_min) * px_per_min - y;
            ctx.fillRect(i * px_per_month, y, px_per_month, height);

            y = ((rise_hs) * 60 + rise_min) * px_per_min;
            height = h - y;

            ctx.fillRect(i * px_per_month, y, px_per_month, height);
        }

    }

    // Draw dso

    {
        // Calculate for January and interpolate until January next year
        let dso_jan_times = calculate_rise_set(
            threshold_alt, eq_to_geo(dso.coords), sun_times[0].day, lat_lon);

        ctx.fillStyle = color_visible;

        switch (dso_jan_times.type) {
            case "normal":
                let rise_hs = dso_jan_times.rise.getHours();
                let rise_min = dso_jan_times.rise.getMinutes();
                let set_hs = dso_jan_times.set.getHours();
                let set_min = dso_jan_times.set.getMinutes();

                if (rise_hs * 60 + rise_min > set_hs * 60 + set_min) {
                    set_hs += 24;
                }

                let y = ((rise_hs) * 60 + rise_min) * px_per_min;
                let height = ((set_hs) * 60 + set_min) * px_per_min - y;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y - 24 * 60 * px_per_min);
                ctx.lineTo(w, y - 24 * 60 * px_per_min + height);
                ctx.lineTo(0, y + height);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0, y - 24 * 60 * px_per_min);
                ctx.lineTo(w, y - 2 * 24 * 60 * px_per_min);
                ctx.lineTo(w, y - 2 * 24 * 60 * px_per_min + height);
                ctx.lineTo(0, y - 24 * 60 * px_per_min + height);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0, y + 24 * 60 * px_per_min);
                ctx.lineTo(w, y);
                ctx.lineTo(w, y + height);
                ctx.lineTo(0, y + 24 * 60 * px_per_min + height);
                ctx.closePath();
                ctx.fill();
                break;

            case "above":
                ctx.fillRect(0, 0, w, h);
                break;

            case "below":
                break;
        }


    }

    return;

    // Calculate DSO rise and set times for each day on the sunrises array

    let dso_times = [] // Times when DSO rises and sets
    for (let i = 0; i < sun_times.length; i++) {
        let date = sun_times[i].day;
        dso_times.push(calculate_rise_set(threshold_alt, eq_to_geo(dso.coords), date, lat_lon));
    }
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

/**
 * Draw day/night plots for a given year.
 *
 * This function returns off-screen canvas to be used as a background for
 * subsequent visibility plots. Draws a canvas for each size given.
 *
 * Size is an array of arrays, e.g.: [[w1, h1], [w2, h2], ...]
 *
 * Off-screen does not mean a canvas with position -999999px, the canvas
 * is only on memory and not added to the webpage.
 *
 * Reference:
 *
 * https://devbutze.blogspot.com/2014/02/html5-canvas-offscreen-rendering.html
 *
 * Debouncer:
 *
 * https://stackoverflow.com/a/16128377
 */
export function draw_day_night_plots(
    lat_lon,
    sizes,
    threshold_alt,
    year
) {

    let color_day = "#2b3840";
    let color_night = "#222222";

    // Create canvases

    let canvases = [];
    for (let size of sizes) {
        canvases.push(
            $("<canvas>", { width: size[0], height: size[1] })[0]
        );
    }

    // Calculate sunsets and sunrises

    let sun_times = [];

    let sun = Celestial.Kepler().id("sol");
    for (let month = 0; month < 12; month++) {

        let date = new Date(year, month, 1);

        let ra_dec = sun(date)
            .equatorial(Celestial.origin(date).spherical())
            .pos;

        sun_times.push(calculate_rise_set(
            threshold_alt,
            ra_dec,
            date,
            lat_lon
        ));
    }

    // Calculate vertical span of the plot
    //
    // Vertically, the center of the plot corresponds to midnight. More
    // specifically the time when the sun is at the lowest point on 1st of
    // January. I calculate midnight time for 1st January, during the year this
    // time changes slightly (rougly +/-20min) so I ignore that.
    //
    // The vertical span is the length of the longest day on the year plus 2hs
    // to add a margin. Keep in mind that on big latitudes there are days when
    // the sun never sets so in that case the vertical span is 24hs.
    //
    // Times in fractional hours, the plot goes from min_hs to max_hs
    //
    // As the plot is centered on midnight, quite probably min_hs < 0 or
    // max_hs > 24

    let midnight_hs = fractional_hours(sun_times[0].lowest);
    let min_hs = midnight_hs;
    let max_hs = midnight_hs;
    for (let sun_time of sun_times) {
        switch (sun_time.type) {
            case "above":
                // No night
                break;

            case "below":
                // Always night
                min_hs = midnight_hs - 12;
                max_hs = midnight_hs + 12;
                break;

            case "normal":
                // Starting from midnight, measure time to sunrise and multiply
                // by two
                let rise_hs = fractional_hours(sun_time.rise)
                let set_hs = fractional_hours(sun_time.set)

                if (rise_hs < midnight_hs) {
                    rise_hs += 24;
                }
                if (set_hs > midnight_hs) {
                    set_hs -= 24;
                }
                min_hs = Math.min(min_hs, set_hs);
                max_hs = Math.max(max_hs, rise_hs);
                break;
        }
    }
    min_hs -= 1;
    max_hs += 1;
    let span_hs = max_hs - min_hs;

    // Start to actually draw the plots for each given size

    for (let canvas of canvases) {
        let ctx = canvas.getContext("2d", { alpha: false} );

        let canvas_w = canvas.width;
        let canvas_h = canvas.height;

        /**
         * Get y position for given fractional hours
         */
        function hs_to_y(hs) {
            return ((hs - min_hs) / span_hs) * canvas_h;
        }

        /**
         * Get h position for given date. Depends on month and day of date.
         */
        function date_to_x(date) {
            return (date.getMonth() / 12) * canvas_w;
        }

        // Draw background

        ctx.fillStyle = color_day;
        ctx.fillRect(0, 0, canvas_w, canvas_h);

        // Draw night
        //
        // I ignore the fact that some months have more day than others, I just
        // iterate over each element on sun_times and I give each one the same
        // width.

        let bar_width = canvas_w / sun_times.length;

        ctx.fillStyle = color_night;
        for (let i = 0; i < sun_times.length; i++) {
            let sun_time = sun_times[i];
            switch (sun_time.type) {
                case "above":
                    // Always daylight
                    break;

                case "below":
                    // Fill from top to bottom
                    ctx.fillRect(
                        date_to_x(sun_time.day), 0,
                        bar_width, canvas_h
                    );
                    break;

                case "normal":
                    // Check sunset and sunrise times
                    let rise_hs = fractional_hours(sun_time.rise)
                    let set_hs = fractional_hours(sun_time.set)
                    if (rise_hs < midnight_hs) {
                        rise_hs += 24;
                    }
                    if (set_hs > midnight_hs) {
                        set_hs -= 24;
                    }
                    ctx.fillRect(
                        date_to_x(sun_time.day), hs_to_y(set_hs),
                        bar_width, hs_to_y(rise_hs) - hs_to_y(set_hs)
                    );
                    break;
            }
        }
    }

    return canvases;
}
