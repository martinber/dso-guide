/**
 * Contains the celestial configuration
 */

export let config = {

    // Default width, 0 = full parent element width; height is determined by
    // projection
    width: 0,

    projection: "stereographic",

    // optional initial geographic position [lat,lon] in degrees
    geopos: [0, 0],

    // initial zoom level 0...zoomextend; 0|null = default, 1 = 100%, 0 < x <= zoomextend
    zoomlevel: null,

    // maximum zoom level
    zoomextend: 1, // 1: disabled

    // Sizes are increased with higher zoom-levels
    adaptable: true,

    // Enable zooming and rotation with mousewheel and dragging
    interactive: false,

    // Keep orientation angle the same as center[2]
    orientationfixed: true,

    // On which coordinates to center the map, default: zenith, if location
    // enabled, otherwise center
    follow: "zenith",

    // Display form for interactive settings
    form: false,

    // Display location settings (no center setting on form)
    location: true,

    // Display zoom controls
    controls: false,

    // Language for names, so far only for constellations: de: german, es:
    // spanish. Default:en or empty string for english
    lang: "",

    // TODO
    // ID of parent element, e.g. div, null = html-body
    container: "celestial-container",

    // Path/URL to data files, empty = subfolder 'data'
    datapath: "/data/",

    stars: {

        show: true,

        // Show only stars brighter than limit magnitude
        limit: 6,

        // Show stars in spectral colors, if not use default color
        colors: true,

        // Style for stars
        style: { fill: "#ffffff", opacity: 1 },

        // Show star designation (Bayer, Flamsteed, Variable star, Gliese,
        // whichever applies first in that order)
        names: false,

        // Show proper name (if one exists)
        proper: false,

        // Show all designations, including Draper and Hipparcos
        desig: false,

        // Show only names/designations for stars brighter than namelimit
        namelimit: 2.5,

        // Style for star designations
        namestyle: {
            fill: "#ddddbb", font: "11px Georgia, Times, 'Times Roman', serif",
            align: "left", baseline: "top"
        },

        // Styles for star names
        propernamestyle: {
            fill: "#ddddbb", font: "11px Georgia, Times, 'Times Roman', serif",
            align: "right", baseline: "bottom"
        },

        // Show proper names for stars brighter than propernamelimit
        propernamelimit: 1.5,

        // Maximum size (radius) of star circle in pixels
        size: 7,

        // Scale exponent for star size, larger = more linear
        exponent: -0.28,

        // Data source for stellar data, number indicates limit magnitude
        data: 'stars.6.json'
    },

    dsos: {

        show: false,

        // Show only DSOs brighter than limit magnitude
        limit: 6,

        // Show DSO names
        names: false,

        // Show short DSO names
        desig: false,

        // Style for DSO names
        namestyle: { fill: "#cccccc", font: "11px Helvetica, Arial, serif",
            align: "left", baseline: "top" },

        // Show only names for DSOs brighter than namelimit
        namelimit: 6,

        // Optional seperate scale size for DSOs, null = stars.size
        size: null,

        // Scale exponent for DSO size, larger = more non-linear
        exponent: 1.4,

        // Data source for DSOs, opt. number indicates limit magnitude
        data: 'dsos.bright.json',

        //DSO symbol styles, 'stroke'-parameter present = outline
        symbols: {

            gg:  { shape: "circle", fill: "#ff0000" },  // Galaxy cluster
            g:   { shape: "ellipse", fill: "#ff0000" }, // Generic galaxy
            s:   { shape: "ellipse", fill: "#ff0000" }, // Spiral galaxy
            s0:  { shape: "ellipse", fill: "#ff0000" }, // Lenticular galaxy
            sd:  { shape: "ellipse", fill: "#ff0000" }, // Dwarf galaxy
            e:   { shape: "ellipse", fill: "#ff0000" }, // Elliptical galaxy
            i:   { shape: "ellipse", fill: "#ff0000" }, // Irregular galaxy
            oc:  { shape: "circle", fill: "#ffcc00",
                stroke: "#ffcc00", width: 1.5 },        // Open cluster
            gc:  { shape: "circle", fill: "#ff9900" },  // Globular cluster
            en:  { shape: "square", fill: "#ff00cc" },  // Emission nebula
            bn:  { shape: "square", fill: "#ff00cc",
                stroke: "#ff00cc", width: 2 },          // Generic bright nebula
            sfr: { shape: "square", fill: "#cc00ff",
                stroke: "#cc00ff", width: 2 },          // Star forming region
            rn:  { shape: "square", fill: "#00ooff" },  // Reflection nebula
            pn:  { shape: "diamond", fill: "#00cccc" }, // Planetary nebula
            snr: { shape: "diamond", fill: "#ff00cc" }, // Supernova remnant
            dn:  { shape: "square", fill: "#999999",
                stroke: "#999999", width: 2 },          // Dark nebula grey
            pos: { shape: "marker", fill: "#cccccc",
                stroke: "#cccccc", width: 1.5 }         // Generic marker

        }
    },

    // Show planet locations, if date-time is set
    planets: {

        show: false,

        // List of all objects to show
        which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"],

        // Font styles for planetary symbols
        style: { fill: "#00ccff", font: "bold 17px 'Lucida Sans Unicode', Consolas, sans-serif",
            align: "center", baseline: "middle" },

        // Character and color for each symbol in 'which', simple circle \u25cf
        symbols: {
            "sol": {symbol: "\u2609", fill: "#ffff00"},
            "mer": {symbol: "\u263f", fill: "#cccccc"},
            "ven": {symbol: "\u2640", fill: "#eeeecc"},
            "ter": {symbol: "\u2295", fill: "#00ffff"},
            "lun": {symbol: "\u25cf", fill: "#ffffff"}, // overridden by generated cresent
            "mar": {symbol: "\u2642", fill: "#ff9999"},
            "cer": {symbol: "\u26b3", fill: "#cccccc"},
            "ves": {symbol: "\u26b6", fill: "#cccccc"},
            "jup": {symbol: "\u2643", fill: "#ff9966"},
            "sat": {symbol: "\u2644", fill: "#ffcc66"},
            "ura": {symbol: "\u2645", fill: "#66ccff"},
            "nep": {symbol: "\u2646", fill: "#6666ff"},
            "plu": {symbol: "\u2647", fill: "#aaaaaa"},
            "eri": {symbol: "\u25cf", fill: "#eeeeee"}
        }
    },
    constellations: {

        show: true,

        // Show constellation names
        names: false,

        // Show short constellation names (3 letter designations)
        desig: false,

        // Style for constellations, with different fonts for different ranked
        // constellation
        namestyle: { fill:"#cccc99", align: "center", baseline: "middle",
            font: ["14px Helvetica, Arial, sans-serif",
                "12px Helvetica, Arial, sans-serif",
                "11px Helvetica, Arial, sans-serif"]},

        // Show constellation lines, style below
        lines: true,
        linestyle: { stroke: "#cccccc", width: 1, opacity: 0.6 },

        // Show constellation boundaries, style below
        bounds: false,
        boundstyle: { stroke: "#cccc00", width: 0.5, opacity: 0.8, dash: [2, 4] }

    },

    mw: {

        // Show Milky Way as filled multi-polygon outlines
        show: true,

        // Style for MW layers
        style: { fill: "#ffffff", opacity: 0.15 }

    },

    // Display & styles for graticule & some planes
    lines: {
        graticule: { show: true, stroke: "#cccccc", width: 0.6, opacity: 0.8,
            // grid values: "outline", "center", or [lat,...] specific position
            lon: {pos: [""], fill: "#eee", font: "10px Helvetica, Arial, sans-serif"},
            // grid values: "outline", "center", or [lon,...] specific position
            lat: {pos: [""], fill: "#eee", font: "10px Helvetica, Arial, sans-serif"}},

        equatorial: { show: true, stroke: "#aaaaaa", width: 1.3, opacity: 0.7 },
        ecliptic: { show: true, stroke: "#66cc66", width: 1.3, opacity: 0.7 },
        galactic: { show: false, stroke: "#cc6666", width: 1.3, opacity: 0.7 },
        supergalactic: { show: false, stroke: "#cc66cc", width: 1.3, opacity: 0.7 }
    },

    // Background style
    background: {

        // Area fill
        fill: "#000000",
        opacity: 1,

        // Outline
        stroke: "#000000",
        width: 1.5

    },

    // Show horizon marker, if location is set and map projection is all-sky
    horizon: {

        // Line
        show: false,
        stroke: "#000099",
        width: 1.0,

        // Area below horizon
        fill: "#000000",
        opacity: 0.5

    }
};

