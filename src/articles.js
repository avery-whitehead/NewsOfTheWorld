/**
 * Class definition for an Article. Each click on the map returns up to
 * five Article objects
 * @param {string} title The title of the article
 * @param {string} description A short description of the article contents
 * @param {string} link A link to the article
 * @param {string} site The site this article comes from
 */
class Article {
    constructor(title, description, link, site) {
        this.title = title;
        this.description = description;
        this.link = link;
        this.site = site;
    }

    /**
     * Prints each attribute value to the console
     */
    printArticle() {
        console.log(this.title);
        console.log(this.description);
        console.log(this.link);
        console.log(this.site);
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
        // If not on mobile device, show sidebar at start
        let mobile = window.matchMedia('(max-width: 767px)');
        searchNews('', '', '');
        if (!mobile.matches) {
            sidebar.show();
        }
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
 * Listener function taking an event object, performs a reverse geocode lookup
 * on the latitude and longitude returned from a click event
 * @param {*} event An event object that fires when the map is clicked on
 */
function onMapClick(event) {
    let latlng = event.latlng.wrap();
    console.log(latlng)
    let cors = 'https://cors-anywhere.herokuapp.com';
    // Reverse address lookup from latlng
    let url = `${cors}/https://eu1.locationiq.org/v1/reverse.php?key=ce51d023f628dc` +
        `&lat=${latlng.lat}` +
        `&lon=${latlng.lng}` +
        '&format=json' +
        '&zoom=12' +
        '&addressdetails=1' + 
        '&extratags=1';
    let address = fetchRequest(url, 'application/json', 'cors');
    // Resolves the promise returned from the fetch
    address.then(response => {
        let json = JSON.parse(response);
        clearSidebarBody();
        setSidebarTitle(json);
        getAddressDetails(json);
    });
}


/**
 * Creates a hierarchical search string based on an address
 * @param {JSON} addressJson The address in JSON format
 */
function getAddressDetails(addressJson) {
    let address = addressJson.address;
    let searchString = '';
    let local = '';
    let regional = '';
    let national = address.country;

    if (address.suburb !== undefined) {
        local = address.suburb;
    } else if (address.village !== undefined) {
        local = address.village;
    } else if (address.town !== undefined) {
        local = address.town;
    } else if (address.city !== undefined) {
        local = address.city;
    }

    if (address.county !== undefined) {
        regional = address.county;
    } else if (address.region !== undefined) {
        regional = address.region;
    } else if (address.state !== undefined) {
        regional = address.state;
    }

    // Extends short country names
    if (national === 'PRC') 
        national = 'China';
    if (national === 'ROC')
        national = 'Thailand';
    if (national === 'RSA')
        national = 'South Africa';
    setSidebarTitle(local, regional, national);
    searchNews(local, regional, national);
}

/**
 * Uses the local, regional and national address terms to perform
 * a Google News RSS search
 * @param {*} local 
 * @param {*} regional 
 * @param {*} national 
 */
function searchNews(local, regional, national) {
    let cors = 'https://cors-anywhere.herokuapp.com';
    let url = '';
    let localSrch = slugify(local);
    let regionalSrch = slugify(regional);
    let nationalSrch = slugify(national);
    let articles = [];
    let didNationalSrch = false;

    // If the address lookup only returned the country
    if (localSrch == '' && regionalSrch == '') {
        url = `${cors}/https://news.google.com/news?` +
            `q=${nationalSrch}&output=rss`;
        didNationalSrch = true;
    } else {
        url = `${cors}/https://news.google.com/news?` +
            `q=${localSrch}+${regionalSrch}&output=rss`;
    }

    let rss = fetchRequest(url, 'text/html', 'cors');
    rss.then(function(response) {
        articles = getArticles(response);
        // If no articles are returned by the local/regional search
        if (articles.length === 0 && didNationalSrch === false) {
            url = `${cors}/https://news.google.com/news?` + 
                `q=${nationalSrch}&output=rss`;
            rss = fetchRequest(url, 'text/html','cors');
            rss.then(function(response) {
                articles = getArticles(response);
                setSidebarBody(articles);
            })
        } else {
            setSidebarBody(articles);
        }
    });
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
    let items = rssJson.rss.channel.item;

    // First item is a deprecation warning, not a news article
    if (items.length != undefined) {
        // Stop array from going out of bounds if there's less than five articles
        if (items.length <= 6) {
            ITEM_COUNT = item.length;
        }
        for (let i = 1; i <= ITEM_COUNT; i++) {
            let fullTitle = items[i].title;
            let title = fullTitle.split(' - ')[0];
            let desc = getTextFromArticle('desc', items[i].description);
            let site = getTextFromArticle('site', items[i].description);
            // Link is prefixed by a Google News URL separated by '&url='
            let link = items[i].link.split('&url=')[1]
            // TODO: Find an image search API and search the title to get an image
            let image = ''
            articles.push(new Article(title, desc, link, site));
        }
    }
    return articles
}


/**
 * Parses the HTML table in the RSS XML and gets some text via a CSS selector
 * @param {string} textType The type of text to extract, either 'desc' or
 * 'site'
 * @param {string} html The HTML table containing the description
 * @return {string} The description text extracted from the table
 */
function getTextFromArticle(textType, html) {
    let parser = new DOMParser();
    let selector = ''

    if (textType === 'desc') {
        selector = 'body > table > tbody > tr > td.j > font > div.lh > font:nth-child(5)';
    } else if (textType === 'site') {
        selector = 'body > table > tbody > tr > td.j > font > div.lh > font:nth-child(3) > b > font';
    }

    let parsed = parser.parseFromString(html, 'text/html');
    let text = parsed.querySelector(selector).innerHTML;
    let textNoTags = text.replace(/<(.|\n)*?>/g, '');
    return textNoTags;
}


/**
 * A generic fetch request to get some data from a REST API
 * @param {string} url The URI to fetch from
 * @param {string} contentType The content type to put in the header
 * @param {string} mode The mode to be used for the request (cors, no-cors)
 * @return {string} The body of the response given to the fetch request
 */
function fetchRequest(url, contentType, mode) {
    return fetch(url, {
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            'user-agent': window.navigator.userAgent
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