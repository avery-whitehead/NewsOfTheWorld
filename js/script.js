/**
 * Loads the Leaflet map and applies the layers to it.
 */
function loadMap() {
    let map = L.map('id-map', {
        maxBounds: [[-5600, -5600], [5600, 5600]],
        maxBoundsViscosity: 1.0
    }).setView([54, -1.5], 4);

    let mapMaxZoom = 12;
    let mapMinZoom = 3;
    let mapBounds = [[-8576 / 2, -8576 / 2], [8576 / 2, 8576 / 2]];

    // Background map layer
    let stamenWatercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
            '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
            'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        ext: 'png',
        bounds: mapBounds
    });

    // Borders and cities layer
    let stamenLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
            '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
            'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

/**
 * Listener function taking an event object, performs an OSM reverse lookup
 * on the latitude and longitude returned from a click event.
 * @param {object} event An event object that fires when the map is clicked on
 */
function onMapClick(event) {
    console.log(window.navigator.userAgent);
    let latlng = event.latlng.wrap();
    // Reverse address lookup from latlng
    let url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`
    fetch(url, {
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'user-agent': window.navigator.userAgent,
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer'
    })
    .then(response => response.json())
    .then((output) => {
        searchNews(output);
    })
    .catch(err => {
        throw err
    });
}

/**
 * Returns a Google News RSS feed for a query of this address
 * @param {json} address JSON-formatted address information
 */
function searchNews(address) {
    console.log(address.address);
}

window.onload = loadMap;