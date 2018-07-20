/**
 * Loads the Leaflet map and applies the layers to it
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
    let stamenWatercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">' +
            'Stamen Design</a>, ' +
            '<a href="http://creativecommons.org/licenses/by/3.0">' +
            'CC BY 3.0</a> &mdash; ' +
            'Map data &copy; ' +
            '<a href="http://www.openstreetmap.org/copyright">' +
            'OpenStreetMap</a>',
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        bounds: mapBounds
    });

    // Borders and cities layer
    let stamenLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">' +
            'Stamen Design</a>, ' +
            '<a href="http://creativecommons.org/licenses/by/3.0">' +
            'CC BY 3.0</a> &mdash; ' +
            'Map data &copy; ' +
            '<a href="http://www.openstreetmap.org/copyright">' +
            'OpenStreetMap</a>',
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        bounds: mapBounds
    });

    stamenWatercolor.addTo(map);
    stamenLabels.addTo(map);
    map.on('click', onMapClick);
}


/**
 * Listener function taking an event object, performs an OSM reverse lookup
 * on the latitude and longitude returned from a click event
 * @param {object} event An event object that fires when the map is clicked on
 */
function onMapClick(event) {
    let latlng = event.latlng.wrap();
    console.log(latlng)
    // Reverse address lookup from latlng
    let url = 'https://nominatim.openstreetmap.org/reverse?' +
        'format=json' +
        `&lat=${latlng.lat}` +
        `&lon=${latlng.lng}` +
        '&addressdetails=1' + 
        '&accept-language=en';
    let address = fetchRequest(url, 'application/json', 'cors');
    // Resolves the promise returned from the fetch
    address.then(response => {
        let json = JSON.parse(response).address;
        console.log(json);
        searchNews(json);
    });
}


/**
 * Returns a Google News RSS feed for a query of this address
 * Looks for the most local existing values for urban area and
 * administrative area, and uses those for the query
 * @param {json} address JSON-formatted address information
 * @return {string} Some stuff about the news (headline, body, etc)
 */
function searchNews(address) {
    let local = '';
    let national = '';

    //TODO: better hierarchy
    if (address === undefined) {
        console.log('No information found');
    } else {
        if (address.suburb !== undefined) {
            local = address.suburb;
        } else if (address.city_district !== undefined) {
            local = address.city_district;
        } else if (address.town !== undefined) {
            local = address.town;
        } else if (address.city !== undefined) {
            local = address.city;
        }

        if (address.county !== undefined) {
            national = address.county;
        } else if (address.state_district !== undefined) {
            national = address.state_district;
        } else if (address.state !== undefined) {
            national = address.state;
        } else if (address.country !== undefined) {
            national = address.country;
        }
        // Transliterate and remove any special characters (slugify)
        local = slugify(local);
        national = slugify(national);
        let cors = 'https://cors-anywhere.herokuapp.com'
        let url = `${cors}/https://news.google.com/news?q=${local}+${national}&output=rss`;
        console.log(url)
        let rss = fetchRequest(url, 'application/rss+xml', 'cors');
        rss.then(function(response) {
            console.log(response);
        });
    }
}


/**
 * A generic fetch request to get some data from a REST API
 * @param {*} url The URI to fetch from
 * @param {*} contentType The content type to put in the header 
 * @param {*} mode The mode to be used for the request (cors, no-cors)
 */
function fetchRequest(url, contentType, mode) {
    //TODO: fix lookup
    return fetch(url, {
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            'user-agent': window.navigator.userAgent,
            'content-type': contentType
        },
        method: 'GET',
        mode: mode,
        referrer: 'client'
    }).then(function(response) {
        return response.text();
    }).catch(function(error) {
        console.log(error.message)
    });
}


window.onload = loadMap;