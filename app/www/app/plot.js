/**
 * Things related to the time vs height plots
 */

import {
    eq_to_geo,
    deg_to_hms,
    fractional_hours,
    calculate_rise_set
} from "./tools.js";

export function draw_visibility_plot(
    canvas,
    back_canvas,
    dso,
    lat_lon,
    threshold_alt,
    year,
    min_hs,
    max_hs
) {
    let ctx = canvas.getContext("2d", { alpha: false} );

    // Get size from CSS size
    let canvas_w = canvas.scrollWidth;
    let canvas_h = canvas.scrollHeight;
    canvas.width = canvas_w;
    canvas.height = canvas_h;

    let color_visible = "#FF6C6C50";
    let color_grid = "#00000085";

    let width_grid = 2;

    // Draw background

    ctx.drawImage(back_canvas, 0, 0, canvas_w, canvas_h);

    // Draw dso

    let span_hs = max_hs - min_hs;
    /**
     * Get y position for given fractional hours
     */
    function hs_to_y(hs) {
        return Math.floor(((hs - min_hs) / span_hs) * canvas_h);
    }

    // Calculate for January and interpolate until January next year
    let dso_jan_times = calculate_rise_set(
        threshold_alt, eq_to_geo(dso.coords), new Date(year, 0, 1), lat_lon);

    ctx.fillStyle = color_visible;

    switch (dso_jan_times.type) {
        case "normal":
            let rise_hs = fractional_hours(dso_jan_times.rise);
            let set_hs = fractional_hours(dso_jan_times.set);

            while (rise_hs < min_hs) {
                rise_hs += 24;
            }
            while (set_hs < rise_hs) {
                set_hs += 24;
            }

            let rise_y = hs_to_y(rise_hs);
            let set_y = hs_to_y(set_hs);
            let day_h = hs_to_y(24) - hs_to_y(0);
            let pass_h = set_y - rise_y;

            // Draw pass polygon
            ctx.beginPath();
            ctx.moveTo(0, rise_y);
            ctx.lineTo(canvas_w, rise_y - day_h);
            ctx.lineTo(canvas_w, rise_y - day_h + pass_h);
            ctx.lineTo(0, rise_y + pass_h);
            ctx.closePath();
            ctx.fill();

            // Draw pass polygon 24hs above
            ctx.beginPath();
            ctx.moveTo(0, rise_y - day_h);
            ctx.lineTo(canvas_w, rise_y - 2 * day_h);
            ctx.lineTo(canvas_w, rise_y - 2 * day_h + pass_h);
            ctx.lineTo(0, rise_y + pass_h - day_h);
            ctx.closePath();
            ctx.fill();

            // Draw pass polygon 24hs below
            ctx.beginPath();
            ctx.moveTo(0, rise_y + day_h);
            ctx.lineTo(canvas_w, rise_y);
            ctx.lineTo(canvas_w, rise_y + pass_h);
            ctx.lineTo(0, rise_y + pass_h + day_h);
            ctx.closePath();
            ctx.fill();
            break;

        case "above":
            ctx.fillRect(0, 0, canvas_w, canvas_h);
            break;

        case "below":
            break;
    }

    return canvas;
}

/**
 * Draw day/night plots for a given year.
 *
 * This function returns off-screen canvas to be used as a background for
 * subsequent visibility plots. Also returns the fractional hours of the top and
 * bottom
 *
 * Size is an array [w, h1]
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
    size,
    threshold_alt,
    year
) {

    let color_day = "#212c31";
    let color_night = "#000000";

    // Calculate sunsets and sunrises

    let sun_times = [];
    let sun = Celestial.Kepler().id("sol");
    let end = new Date(year, 11, 31); // 31 Dec
    for (let date = new Date(year, 0, 1);
         date <= end;
         date.setDate(date.getDate() + 1)) {

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

    let jan_midnight_hs = fractional_hours(sun_times[0].lowest);
    let min_hs = jan_midnight_hs;
    let max_hs = jan_midnight_hs;
    for (let sun_time of sun_times) {
        switch (sun_time.type) {
            case "above":
                // No night
                break;

            case "below":
                // Always night
                min_hs = jan_midnight_hs - 12;
                max_hs = jan_midnight_hs + 12;
                break;

            case "normal":
                // Starting from midnight, measure time to sunrise and multiply
                // by two
                //
                // Here it is important to use the time of midnight of this
                // specific day, because if I use jan_midnight_hs a bug can
                // happen sometimes on really short nights on very high latitude
                // places, when jan_midnight_hs falls actually during the day

                let midnight_hs = fractional_hours(sun_time.lowest);
                let rise_hs = fractional_hours(sun_time.rise)
                let set_hs = fractional_hours(sun_time.set)

                while (rise_hs < midnight_hs) {
                    rise_hs += 24;
                }
                while (set_hs > midnight_hs) {
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

    // Start to actually draw the plot

    let canvas = $("<canvas>")[0];
    let ctx = canvas.getContext("2d", { alpha: false} );

    let canvas_w = size[0];
    let canvas_h = size[1];
    canvas.width = canvas_w;
    canvas.height = canvas_h;

    /**
     * Get y position for given fractional hours
     */
    function hs_to_y(hs) {
        return Math.floor(((hs - min_hs) / span_hs) * canvas_h);
    }

    // Draw background

    ctx.fillStyle = color_day;
    ctx.fillRect(0, 0, canvas_w, canvas_h);

    // Draw night
    //
    // I ignore the fact that some months have more day than others, I just
    // iterate over each element on sun_times and I give each one the same
    // width.

    let bar_width = Math.ceil(canvas_w / sun_times.length);

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
                    Math.floor(i / sun_times.length * canvas_w),
                    0,
                    bar_width,
                    canvas_h
                );
                break;

            case "normal":
                // Check sunset and sunrise times
                //
                // Here it is important to use the time of midnight of this
                // specific day, because if I use jan_midnight_hs a bug can
                // happen sometimes on really short nights on very high latitude
                // places, when jan_midnight_hs falls actually during the day

                let midnight_hs = fractional_hours(sun_time.lowest);
                let rise_hs = fractional_hours(sun_time.rise)
                let set_hs = fractional_hours(sun_time.set)
                while (rise_hs < midnight_hs) {
                    rise_hs += 24;
                }
                while (set_hs > midnight_hs) {
                    set_hs -= 24;
                }
                ctx.fillRect(
                    Math.floor(i / sun_times.length * canvas_w),
                    hs_to_y(set_hs),
                    bar_width,
                    Math.ceil(hs_to_y(rise_hs) - hs_to_y(set_hs))
                );
                break;
        }
    }

    return [canvas, min_hs, max_hs];
}

/**
 * Show popup with big plot
 *
 * Close previous popup if any
 */
export function show_visibility_popup(
    back_canvas,
    dso,
    lat_lon,
    threshold_alt,
    sun_threshold_alt,
    year,
    min_hs,
    max_hs,
    close_callback
) {

    // Close previous popup if any

    $(".plot-popup").remove();

    let popup = $("<figure>", { class: "plot-popup" }).html(
        `<div class="plot-popup-scrollable">
            <button class="plot-popup-close">
                <img src="/resources/close.svg" alt="close" />
            </button>
            <h2></h2>
            <div class="plot-popup-values"></div>
            <p class="plot-popup-description"></p>
            <div class="plot-popup-grid">
                <div class="plot-popup-hours"></div>
                <canvas class="plot-popup-canvas"></canvas>
                <table class="plot-popup-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <p>Table values for 15th day of each month</p>
        </div>`
    );
    popup.appendTo("body");

    // Connect close button

    popup.find(".plot-popup-close").click(() => popup.remove());

    // Set the text for some fields

    popup.find("h2").html(`Visibility plot for ${dso.name}`);
    popup.find(".plot-popup-description").html(
        `Moments when DSO is over ${threshold_alt}° are highlighted on red <br />
        Background is black at night (sun below ${sun_threshold_alt}°) or blue
        during the day`
    );

    // Draw the canvas

    let canvas = popup.find(".plot-popup-canvas")[0];
    draw_visibility_plot(canvas, back_canvas, dso, lat_lon, threshold_alt,
        year, min_hs, max_hs);

    // Calculate rise and set times for every 15th day of each month
    // Do the same for the sun too

    let dso_times = [];
    for (let month_index = 0; month_index < 12; month_index++) {

        dso_times.push(
            calculate_rise_set(
                threshold_alt, eq_to_geo(dso.coords),
                new Date(year, month_index, 15), lat_lon)
        );
    }

    let sun = Celestial.Kepler().id("sol");
    let sun_times = [];
    for (let month_index = 0; month_index < 12; month_index++) {
        let date = new Date(year, month_index, 15);
        let ra_dec = sun(date)
            .equatorial(Celestial.origin(date).spherical())
            .pos;

        sun_times.push(calculate_rise_set(
            sun_threshold_alt,
            ra_dec,
            date,
            lat_lon
        ));
    }

    // The maximum and lowest altitude is the same for any day of the year.
    // Take the dso_time of January (dso_times[0]) and get the highest and
    // lowest altitude. Convert that altitude to HMS and only print degrees
    // (ignoring minutes and seconds).
    let highest_alt = deg_to_hms(dso_times[0].transit_alt)[0]
    let lowest_alt = deg_to_hms(dso_times[0].lowest_alt)[0]
    popup.find(".plot-popup-values").html(
        `Max altitude: ${highest_alt}° <br />
        Min altitude: ${lowest_alt}°`
    );

    // Populate the table

    function format_time(date) {
        if (date == null) {
            return "-";
        } else {
            let hours = date.getHours().toString()
            let minutes = date.getMinutes().toString()
            if (hours.length == 1) { hours = "0" + hours; }
            if (minutes.length == 1) { minutes = "0" + minutes; }
            return `${hours}:${minutes}`;
        }
    }

    let tbody = popup.find(".plot-popup-table tbody");
    let tr = tbody.append($("<tr>"));
    tr.append($("<th>", { text: "Rise" }));
    for (let month_index = 0; month_index < 12; month_index++) {
        tr.append($("<td>", { text: format_time(dso_times[month_index].rise) } ));
    }
    tr = tbody.append($("<tr>"));
    tr.append($("<th>", { text: "Set" }));
    for (let month_index = 0; month_index < 12; month_index++) {
        tr.append($("<td>", { text: format_time(dso_times[month_index].set) } ));
    }
    tr = tbody.append($("<tr>"));
    tr.append($("<th>", { text: "Sunrise" }));
    for (let month_index = 0; month_index < 12; month_index++) {
        tr.append($("<td>", { text: format_time(sun_times[month_index].rise) } ));
    }
    tr = tbody.append($("<tr>"));
    tr.append($("<th>", { text: "Sunset" }));
    for (let month_index = 0; month_index < 12; month_index++) {
        tr.append($("<td>", { text: format_time(sun_times[month_index].set) } ));
    }

    // Show the Y axis labels, I'm going to show about 8 of them

    let span_hs = max_hs - min_hs; // Vertical span of the plot in hours

    // Decide the interval on hours between labels, to avoid having too many of
    // them cramped

    let interval_hs = 0;
    if (span_hs > 20) {
        interval_hs = 3;
    } else if (span_hs > 10) {
        interval_hs = 2;
    } else {
        interval_hs = 1;
    }

    let current = Math.ceil(min_hs);
    while (current < max_hs) {
        // current can be bigger than 24 and less than 0
        let hours = current % 24;
        if (hours < 0) {
            hours += 24;
        }

        let label = $("<span>", { text: `${hours}:00hs` });
        let canvas_height = canvas.scrollHeight;
        let position = ((current - min_hs) / span_hs) * canvas_height;
        label.css("top", `${position}px`);
        popup.find(".plot-popup-hours").append(label)

        current += interval_hs;
    }

    // Draw horizontal grid, one line per hour

    let ctx = canvas.getContext("2d", { alpha: false} );
    current = Math.ceil(min_hs);
    while (current < max_hs) {
        // current can be bigger than 24 and less than 0
        let hours = current % 24;
        if (hours < 0) {
            hours += 24;
        }

        let position = ((current - min_hs) / span_hs) * canvas.height;
        ctx.strokeStyle = "#FFFFFF10";
        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(canvas.width, position);
        ctx.closePath();
        ctx.stroke();

        current += 1;
    }

    // Draw vertical grid, one line per hour

    for (let month = 1; month < 12; month++) {
        let position = month * canvas.width / 12;
        ctx.strokeStyle = "#FFFFFF10";
        ctx.beginPath();
        ctx.moveTo(position, 0);
        ctx.lineTo(position, canvas.height);
        ctx.closePath();
        ctx.stroke();
    }
}

