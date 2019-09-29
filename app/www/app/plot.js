/**
 * Things related to the time vs height plots
 */

import { eq_to_geo, deg_to_hms } from "./dso.js";

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

export function draw_visibility_plot(canvas, dso) {
    let ctx = canvas.getContext("2d", { alpha: false} );

    let w = canvas.scrollWidth;
    let h = canvas.scrollHeight;
    canvas.width = w;
    canvas.height = h;

    let dso_threshold_alt = 15; // Degrees
    let sun_threshold_alt = -10; // Degrees
    let lat_lon = [-33, -63];

    let color_day = "#2b3840";
    let color_night = "#222222";
    let color_visible = "#88666694";
    let color_grid = "#00000085";

    let width_grid = 2;

    // Draw background
    {
        ctx.fillStyle = color_day;
        ctx.fillRect(0, 0, w, h);
    }

    // Draw night
    {
        let sun = Celestial.Kepler().id("sol");

        // Horizontally we iterate over each month, the calculations are made
        // for the first day of each month. On the far right side of the graph
        // the 1st of January is drawn again.
        let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1];
        // for (let month of months) {

            let date = new Date();

            let ra_dec = sun(date)
                .equatorial(Celestial.origin(date).spherical())
                .pos;

            let timezone = -(new Date()).getTimezoneOffset() / 60;
            // calculate_rise_set(0, ra_dec, delta_jd, lat_lon, timezone);

            calculate_rise_set(0, ra_dec, date, lat_lon);

        // }
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

function deg_to_rad(deg) {
    return deg / 180 * Math.PI;
}

function rad_to_deg(rad) {
    return rad * 180 / Math.PI;
}

/**
 * Calculate rise and set times for a given RA/DEC on a given day.
 *
 * The rise and set is calculated according a given altitude in degrees.
 *
 * Give ra_dec on degrees (e.g. using eq_to_geo()).
 *
 * The date object given is used to determine the day. Hours, minutes and
 * seconds are not used.
 *
 * Based on:
 * https://astronomy.stackexchange.com/questions/10904/calculate-time-when-star-is-above-altitude-30
 *
 * Also helped:
 * https://astronomy.stackexchange.com/questions/14492/need-simple-equation-for-rise-transit-and-set-time
 * https://gist.github.com/Tafkas/4742250
 * https://www.aa.quae.nl/en/reken/sterrentijd.html
 */
function calculate_rise_set(alt, ra_dec, date, lat_lon) {

    // Make calculations in radians
    alt = deg_to_rad(alt)
    let ra = deg_to_rad(ra_dec[0]);
    let dec = deg_to_rad(ra_dec[1]);
    let lat = deg_to_rad(lat_lon[0])

    let cos_lha = (Math.sin(alt) - Math.sin(lat) * Math.sin(dec))
                / (Math.cos(lat) * Math.cos(dec));

    let lha = Math.acos(cos_lha);

    // Sidereal times of sunset and sunrise
    let sunset = lha + ra;
    let sunrise = -lha + ra;

    // Convert sidereal times to local times, returns a Date()
    sunset = sidereal_to_time(rad_to_deg(sunset), date, lat_lon[1]);
    sunrise = sidereal_to_time(rad_to_deg(sunrise), date, lat_lon[1]);
}

/**
 * Local sidereal time to local time.
 *
 * Times are interpreted and given as degrees. 0hs = 0°, 12hs = 180°, 24hs =
 * 360°. Give longitude as degrees too.
 *
 * The date object given is used to determine the day. Hours, minutes and
 * seconds are not used.
 *
 * Returns a Date();
 */
function sidereal_to_time(lst, date, longitude) {

    let delta_julian_day = days_since_j2000(date);

    let c = sidereal_constants(delta_julian_day, longitude);
    let theta_1 = c[0];
    let theta_p = c[1];

    let theta_0 = 99.967794687 + 0.98564736628603 * delta_julian_day + theta_p;
    theta_0 = theta_0 % 360;

    // Fractional hours in a sidereal day
    let sidereal_day_hs = 360 / theta_1;

    let time = (lst - theta_0) / theta_1;
    time = time % sidereal_day_hs;
    if (time < 0) {
        time += sidereal_day_hs;
    }

    // Convert from degrees to hours, minutes and seconds
    time = deg_to_hms(time)
    console.log("time", new Date(Date.UTC(2019, 4, 5, time[0], time[1], time[2])).toString());
    console.log("lst", deg_to_hms(lst/15));
}

/**
 * Calculate constants used for sidereal day calculations
 *
 * Taken from: https://www.aa.quae.nl/en/reken/sterrentijd.html
 *
 * The first argument is "Delta Julian Day", integer of days since J2000 (1 Jan
 * 2000).
 *
 * Give longitude as degrees.
 *
 * Returns theta_1 and theta_p.
 */
function sidereal_constants(delta_julian_day, longitude) {
    let theta_1 = 15.04106864026192
                + 2.423233e-14 * delta_julian_day
                + -6.628e-23 * delta_julian_day**2;

    let theta_p = 2.907879e-13 * delta_julian_day**2
                - 5.302e-22 * delta_julian_day**3
                + longitude;

    return [theta_1, theta_p];
}

/**
 * Calculate days since J2000 (1 Jan 2000) as an integer.
 *
 * Taken from d3-celestial
 *
 * I only use the year, month and day from the Date object given.
 *
 * Copyright (c) 2015, Olaf Frohn
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
function days_since_j2000(date) {
    var yr = date.getUTCFullYear();
    var mo = date.getUTCMonth() + 1;
    var dy = date.getUTCDate();

    if ((mo == 1)||(mo == 2)) {
        yr  = yr - 1;
        mo = mo + 12;
    }

    var a = Math.floor(yr / 100);
    var b = 2 - a + Math.floor(a / 4);
    var c = Math.floor(365.25 * yr);
    var d = Math.floor(30.6001 * (mo + 1));

    return b + c + d - 730550 + dy;
}
