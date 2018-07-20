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
 */
function searchNews(address) {
    let local = '';
    let regional = '';
    let national = address.country;


    if (address === undefined) {
        console.log('No information found');
    } else {
        if (address.city_district !== undefined) {
            local = address.city_district;
        } else if (address.town !== undefined) {
            local = address.town;
        } else if (address.city !== undefined) {
            local = address.city;
        }

        if (address.county !== undefined) {
            regional = address.county;
        } else if (address.state_district !== undefined) {
            regional = address.state_district;
        } else if (address.state !== undefined) {
            regional = address.state;
        }

        // Transliterate and remove any special characters (slugify)
        local = slugify(local);
        regional = slugify(regional);
        national = slugify(national);
        let cors = 'https://cors-anywhere.herokuapp.com'
        let url = `${cors}/https://news.google.com/news?q=${local}+${regional}&output=rss`;
        console.log(url)
        let rss = fetchRequest(url, 'application/rss+xml', 'cors');
        rss.then(function(response) {
            getHeadlines(response);
        });
    }
}

/**
 * Converts the RSS XML returned from the Google News query into a JSON
 * object to easily get the headline values from the keys
 * @param {*} rssXml
 * @return {*} An array of objects containing the headline, link, description and image
 */
function getHeadlines(rssXml) {
    let x2js = new X2JS();
    let rssJson = x2js.xml_str2json(rssXml);
    console.log(rssJson);
    let items = rssJson.rss.channel.item;
    for (let i = 1; i < items.length; i++) {
        //TODO: Create array of objects out of the values in items[i]
        console.log(items[i].title);
    }
}


/**
 * A generic fetch request to get some data from a REST API
 * @param {*} url The URI to fetch from
 * @param {*} contentType The content type to put in the header 
 * @param {*} mode The mode to be used for the request (cors, no-cors)
 * @return {string} The body of the response given to the fetch request
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