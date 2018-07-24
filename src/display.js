/**
 * Sets the title of the sidebar to read the location searched for
 * @param {*} local The local-level search term
 * @param {*} regional The regional-level search term
 * @param {*} national The name of the country
 */
function setSidebarTitle(local, regional, national) {
    let displayString = '';
    if (local != '') {
        displayString += `${local}, `;
    }
    if (regional != ''  && local != regional) {
        displayString += `${regional}, `;
    }
    displayString += `${national}`;
    document.getElementById('sidebar-title').innerHTML =displayString;
}


/**
 * Sets the body of the sidebar to read the news articles returned
 * by the search
 * @param {Array[Article]} articles An array of Article objects
 */
function setSidebarBody(articles) {
    articles.forEach(function (article) {
        article.printArticle();
    });
}