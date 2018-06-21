/**
 * Loads the Leaflet map and applies the layers to it.
 */
function loadMap() {
    let map = L.map('id-map', {
        maxBounds: [[-5600, -5600], [5600, 5600]],
        maxBoundsViscosity: 1.0
    }).setView([54, -1.5], 3);

    let mapMaxZoom = 12;
    let mapMinZoom = 3;
    let mapBounds = [[-8576 / 2, -8576 / 2], [8576 / 2, 8576 / 2]];

    // Background map layer
    let stamenWatercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        ext: 'png',
        bounds: mapBounds
    });

    // Borders and cities layer
    let stamenLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        ext: 'png',
        bounds: mapBounds
    });

    stamenWatercolor.addTo(map);
    stamenLabels.addTo(map);
    map.on('click', onMapClick);
}

function onMapClick(event) {
    console.log(event.latlng.wrap());
    // TODO: lookup with lat/long
    // Example JSON search: https://nominatim.openstreetmap.org/reverse?format=json&lat=54.77639823271888&lon=-2.7603149414062504&addressdetails=1
}

window.onload = loadMap;