/**
 * Class definition for an Article. Each click on the map returns up to
 * five Article objects
 * @param {string} title The title of the article
 * @param {string} description A short description of the article contents
 * @param {string} link A link to the article
 * @param {string} picture A picture associated with the article
 */
class Article {
    constructor(title, description, link, picture) {
        this.title = title;
        this.description = description;
        this.link = link;
        this.picture = picture;
    }

    /**
     * Prints each attribute value to the console
     */
    printArticle() {
        console.log(this.title);
        console.log(this.description);
        console.log(this.link);
        console.log(this.picture);
    }
}


/**
 * Loads the Leaflet map and applies the layers to it
 */
function loadMap() {
    let map = L.map('map', {
        maxBounds: [[-5600, -5600], [5600, 5600]],
        maxBoundsViscosity: 1.0
    }).setView([54, -1.5], 4);
    map.doubleClickZoom.disable();

    let sidebar = L.control.sidebar('sidebar', {
        closeButton: true,
        position: 'left'
    });
    map.addControl(sidebar);

    setTimeout(function() {
        document.getElementById('sidebar').style.display = 'block';
    }, 500);

    let mapMaxZoom = 12;
    let mapMinZoom = 3;
    let mapBounds = [[-8576 / 2, -8576 / 2], [8576 / 2, 8576 / 2]];

    // Background map layer
    let stamenWatercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
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
    let stamenLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png', {
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
    map.on('click', function(event) {
        onMapClick(event);
        if (!sidebar.isVisible()) {
            sidebar.show();
        };
    });
}


/**
 * Listener function taking an event object, performs an OSM reverse lookup
 * on the latitude and longitude returned from a click event
 * @param {*} event An event object that fires when the map is clicked on
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
 * @param {JSON} address JSON-formatted address information
 */
function searchNews(address) {
    let local = '';
    let regional = '';
    let url = '';

    //TODO: default to address.country if nothing found
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
        let localSrch = slugify(local);
        let regionalSrch = slugify(regional);
        let national = address.country;
        let state = ''
        if (address.state != undefined) {
            state = address.state;
        }
        // China's country value is 'PRC' which results in some messy results
        if (national == 'PRC') {
            national = 'China'
        }
        let cors = 'https://cors-anywhere.herokuapp.com'
        console.log(localSrch);
        // Some address lookups only return the country
        if (localSrch == '' && regionalSrch == '') {
            url = `${cors}/https://news.google.com/news?q=${nationalSrch}&output=rss`;
        } else {
            url = `${cors}/https://news.google.com/news?q=${localSrch}+${regionalSrch}&output=rss`;
        }
        let rss = fetchRequest(url, 'application/rss+xml', 'cors');
        rss.then(function(response) {
            let articles = getArticles(response);
            if (articles.length == 0) {
                let nationalSrch = slugify(national);
                let stateSrch = slugify(state);
                url = `${cors}/https://news.google.com/news?q=${stateSrch}+${nationalSrch}&output=rss`;
                rss = fetchRequest(url, 'application/rss+xml', 'cors');
                rss.then(function(response) {
                    articles = getArticles(response);
                    setSidebarTitle(local, regional, national);
                    setSidebarBody(articles);
                });
            } else {
                articles = getArticles(response);
                setSidebarTitle(local, regional, national);
                setSidebarBody(articles);
            }
        });
    }
}

/**
 * Converts the RSS XML returned from the Google News query into a JSON
 * object to easily get the article values from the keys
 * @param {string} rssXml
 * @return {[Article]} An array of (at most five) Article objects containing
 * the title, description link and an image
 */
function getArticles(rssXml) {
    let ITEM_COUNT = 5;
    let articles = [];
    let x2js = new X2JS();
    let rssJson = x2js.xml_str2json(rssXml);
    console.log(rssJson);
    let items = rssJson.rss.channel.item;
    // First item is a deprecation warning, not a news article
    if (items.length != undefined) {
        // Stop array from going out of bounds if there's less than five articles
        if (items.length <= 6) {
            ITEM_COUNT = item.length;
        }
        for (let i = 1; i <= ITEM_COUNT; i++) {
            let title = items[i].title;
            let desc = getDescription(items[i].description);
            // Link is prefixed by a Google News URL separated by '&url='
            let link = items[i].link.split('&url=')[1]
            // TODO: Find an image search API and search the title to get an image
            let image = ''
            articles.push(new Article(title, desc, link, image));
        }
    }
    return articles
}


/**
 * Parses the HTML table in the RSS XML and uses a CSS selector to get the
 * description text
 * @param {string} descHtml The HTML table containing the description
 * @return {string} The description text extracted from the table
 */
function getDescription(descHtml) {
    console.log(descHtml);
    let parser = new DOMParser();
    let selector = 'body > table > tbody > tr > td.j > font > div.lh > font:nth-child(5)';
    let parsedDesc = parser.parseFromString(descHtml, 'text/html');
    let desc = parsedDesc.querySelector(selector).innerHTML;
    return desc;
}


/**
 * A generic fetch request to get some data from a REST API
 * @param {string} url The URI to fetch from
 * @param {string} contentType The content type to put in the header 
 * @param {string} mode The mode to be used for the request (cors, no-cors)
 * @return {string} The body of the response given to the fetch request
 */
function fetchRequest(url, contentType, mode) {
    console.log(url)
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