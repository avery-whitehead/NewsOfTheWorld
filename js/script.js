/**
 * Loads the Leaflet map and applies the layers to it.
 */
function loadMap() {
    let map = L.map('id-map', {
        maxBoundsViscosity: 1.0
    }).setView([54, -1.5], 4);
    let mapMaxZoom = 12;
    let mapMinZoom = 2;
    // Background map layer
    let stamenWatercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        ext: 'png'
    });
    // Borders and cities layer
    let stamenLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        ext: 'png'
    });
    stamenWatercolor.addTo(map);
    stamenLabels.addTo(map);
}

window.onload = loadMap;