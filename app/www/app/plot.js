/**
 * Things related to the time vs height plots
 */

import { eq_to_geo } from "./dso.js";

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
            // let alt = Celestial.horizontal(date, ra_dec, lat_lon)[0];


            calculate_rise_set(20, ra_dec, date, lat_lon);

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

/**
 * Calculate rise and set times for a given RA/DEC on a given day.
 *
 * I only use the day from the Date object given.
 *
 * Give ra_dec on degrees (e.g. using eq_to_geo()).
 *
 * https://astronomy.stackexchange.com/questions/10904/calculate-time-when-star-is-above-altitude-30
 * https://astronomy.stackexchange.com/questions/14492/need-simple-equation-for-rise-transit-and-set-time
 * https://gist.github.com/Tafkas/4742250
 * https://www.aa.quae.nl/en/reken/sterrentijd.html
 */
function calculate_rise_set(alt, ra_dec, date, lat_lon) {

    // TODO
    date = new Date(2006, 11, 1);
    lat_lon = [20, 5];
    let tz = 1;

    function deg_to_rad(deg) {
        return deg / 180 * Math.PI;
    }

    function rad_to_deg(rad) {
        return rad * 180 / Math.PI;
    }

    // console.log(lat_lon[0]);

    // Everything in radiasn
    let ra = deg_to_rad(ra_dec[0]);
    let dec = deg_to_rad(ra_dec[1]);
    alt = deg_to_rad(alt)
    let lat = deg_to_rad(lat_lon[0])
    let lon_deg = lat_lon[1];
    let lon = deg_to_rad(lat_lon[1])

    let cos_lha = (Math.sin(alt) - Math.sin(lat) * Math.sin(dec))
                / (Math.cos(lat) * Math.cos(dec));

    let lha = Math.acos(cos_lha);

    let lst = lha + ra;
    let lst2 = -lha + ra;

    // TODO
    lst = deg_to_rad(45);

    // let = lst - (0.06571 * (day = () - 6.622;
//
    // let ut_obj_in_south = (
    
    // let t = 4.894961212735792 + 6.30038809898489 d + ψ
    // let days = (lst - 4.894961212735792 - lon) / 6.30038809898489;
    // fractional days from 2000-01-01 12:00:00 UTC
    
    // let milliseconds = days * 24 * 60 * 60 * 1000;

    // let unix = milliseconds + new Date.getUTCDate("2000-01-01 12:00:00 UTC")
    // let unix = milliseconds + Date.UTC(2000, 0, 1, 12);
    // console.log(lha);
    // console.log(ra_dec);
    // console.log(lst / Math.PI * 180 / 15);
    // console.log(days);

    var jd;
    {
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

        // days since J2000.0
        jd = b + c + d - 730550 + dy;
    }
    console.log("jd", jd);

    let tita_1 = 15.04106864026192 + 2.423233e-14 * jd + -6.628e-23 * jd**2;
    console.log("tita_1", tita_1);
    console.log("lon_deg", lon_deg);
    console.log("tz", tz);
    let tita_p = 2.907879e-13 * jd**2 - 5.302e-22 * jd**3 + lon_deg - tita_1 * tz;
    console.log("tita_p", tita_p);
    let tita_0 = 99.967794687 + 0.98564736628603 * jd + tita_p;
    console.log("tita_0", tita_0);
    tita_0 = tita_0 % 360;
    console.log("tita_0", tita_0);

    let sidereal_day = 360 / tita_1;
    let time = (rad_to_deg(lst) - tita_0) / tita_1;
    time = time % sidereal_day;
    if (time < 0) {
        time += sidereal_day;
    }

    console.log("time", time);
    console.log("lst", lst);
}
