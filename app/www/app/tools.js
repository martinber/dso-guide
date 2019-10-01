
/**
 * Returns the amount of days in a given month.
 *
 * Takes as argument a Date() but only the year and month from it is used.
 *
 * Taken from https://stackoverflow.com/a/1184359
 */
export function days_in_month(date) {
    // Get the zeroth day of the next month, converted automatically to the
    // last day of the previous month
    return new Date(date.getYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Convert equatorial to geographic coordinates for RA/DEC.
 *
 * d3-celestial stores the RA as degrees so d3 draws the map correctly. d3
 * thinks it's drawing the earth instead of the sky.
 *
 * Equatorial:
 * - Right ascension: 0 to 24
 * - Declination: -90 to 90
 *
 * Geographic:
 * - Right ascension: -180 to 180
 * - Declination: -90 to 90
 */
export function eq_to_geo(ra_dec) {
    if (ra_dec[0] > 12) {
        return [(ra_dec[0] - 24) * 15, ra_dec[1]];
    } else {
        return [ra_dec[0] * 15, ra_dec[1]];
    }
}

/**
 * Convert geographic to equatorial coordinates for RA/DEC.
 *
 * d3-celestial stores the RA as degrees so d3 draws the map correctly. d3
 * thinks it's drawing the earth instead of the sky.
 *
 * Equatorial (RA is in hours):
 * - Right ascension: 0 to 24
 * - Declination: -90 to 90
 *
 * Geographic coordinate system (RA is in degrees):
 * - Right ascension: -180 to 180
 * - Declination: -90 to 90
 */
export function geo_to_eq(ra_dec) {
    if (ra_dec[0] < 0) {
        return [ra_dec[0] / 15 + 24, ra_dec[1]];
    } else {
        return [ra_dec[0] / 15, ra_dec[1]];
    }
}

/**
 * Return equatorial coordinates as an array of strings.
 *
 * Equatorial coordinate system:
 * - Right ascension: 0 to 24
 * - Declination: -90 to 90
 */
export function format_eq(ra_dec) {
    let ra = deg_to_hms(ra_dec[0])
    let dec = deg_to_hms(ra_dec[1])

    return [`${ra[0]}h${ra[1]}'${ra[2]}"`, `${dec[0]}°${dec[1]}'${dec[2]}"`];
}

/**
 * Return horizontal coordinates as an array of strings.
 *
 * Ignore minutes and seconds because we do not need much precision, a little
 * difference in time changes them anyway.
 *
 * Horizontal coordinate system:
 * - Altitude: -90 to 90
 * - Azimuth: 0 to 360
 */
export function format_hor(alt_az) {
    let alt = deg_to_hms(alt_az[0])
    let az = deg_to_hms(alt_az[1])


    let cardinal = "";
    {
        // https://stackoverflow.com/questions/7490660/converting-wind-direction-in-angles-to-text-words/25867068#25867068
        var val = Math.floor((az[0] / 22.5) + 0.5);
        var points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        cardinal = points[(val % 16)];
    }

    return [`${alt[0]}°`, `${az[0]}°/${cardinal}`];
}

/**
 * Convert from degrees to hours, minutes, seconds.
 *
 * Supports negative angles, no decimal places on seconds.
 */
export function deg_to_hms(deg) {

    let total_s = deg * 3600; // Total amount of seconds

    let negative = false;
    if (deg < 0) {
        negative = true;
        total_s = total_s * -1;
    }

    let hs = Math.floor(total_s / 3600);
    let min = Math.floor((total_s - hs * 3600) / 60);
    let s = Math.round(total_s - (hs * 3600) - (min * 60));

    if (negative) {
        return [-hs, min, s];
    } else {
        return [hs, min, s];
    }
}

export function deg_to_rad(deg) {
    return deg / 180 * Math.PI;
}

export function rad_to_deg(rad) {
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
 * Returns an object with:
 *
 * {
 *     type: "normal" || "below" || "above"
 *     day: Date() object indicating the day (ignore hours, minutes and seconds)
 *     rise: Date() object indicating rise time or null
 *     set: Date() object indicating set time or null
 * }
 *
 * This is because some objects are always above the given altitude or always
 * below the given altitude.
 *
 * Based on:
 * https://astronomy.stackexchange.com/questions/10904/calculate-time-when-star-is-above-altitude-30
 *
 * Also helped:
 * https://astronomy.stackexchange.com/questions/14492/need-simple-equation-for-rise-transit-and-set-time
 * https://gist.github.com/Tafkas/4742250
 * https://www.aa.quae.nl/en/reken/sterrentijd.html
 */
export function calculate_rise_set(alt, ra_dec, date, lat_lon) {

    let result = {
        type: "normal",
        day: date,
        rise: null,
        set: null
    };

    // Make calculations in radians
    alt = deg_to_rad(alt)
    let ra = deg_to_rad(ra_dec[0]);
    let dec = deg_to_rad(ra_dec[1]);
    let lat = deg_to_rad(lat_lon[0])

    let cos_lha = (Math.sin(alt) - Math.sin(lat) * Math.sin(dec))
                / (Math.cos(lat) * Math.cos(dec));

    // Always above altitude
    if (cos_lha < -1) {
        result.type = "above";
        return result;
    }

    // Always below altitude
    if (cos_lha > 1) {
        result.type = "below";
        return result;
    }

    let lha = Math.acos(cos_lha);

    // Sidereal times of sunset and sunrise
    let set = lha + ra;
    let rise = -lha + ra;

    // Convert sidereal times to local times
    result.set = sidereal_to_time(rad_to_deg(set), date, lat_lon[1]);
    result.rise = sidereal_to_time(rad_to_deg(rise), date, lat_lon[1]);

    return result;
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

    // Return a Date() with the same day given but correct time;
    let result = new Date(date.getTime()); // Clone Date()
    result.setUTCHours(time[0], time[1], time[2])
    return result;
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
