
/**
 * Sets the title of the sidebar to read the location searched for
 * @param {*} local The local-level search term
 * @param {*} regional The regional-level search term
 * @param {*} national The name of the country
 */
function setSidebarTitle(local, regional, national) {
    let displayString = '';
    if (local != '') {
        displayString += `${local}, <br>`;
    }
    if (regional != '' && local != regional) {
        displayString += `${regional}, <br>`;
    }

    displayString += `${national}`;
    document.getElementById('sidebar-title').innerHTML = displayString;
}


/**
 * Removes existing cards from the sidebar
 */
function clearSidebarBody() {
    let cardsDiv = document.getElementById('cards');
    while (cardsDiv.firstChild) {
        cardsDiv.removeChild(cardsDiv.firstChild);
    }
}


/**
 * Sets the body of the sidebar to read the news articles returned
 * by the search
 * Card structure:
 * <div class="card">
 *      <div class="card-body">
 *          <h5 class="card-title"><a></a></h5>
 *          <h6 class="card-subtitle mb-2 text-muted></h6>"
 *          <p class="card-text"></p>
 *      </div>
 * </div>
 * @param {Array[Article]} articles An array of Article objects
 */
function setSidebarBody(articles) {
    // If no articles were returned by the search
    if (articles.length === 0) {
        console.log('No articles found');
    }

    articles.forEach(function (article) {
        // Create the card element
        let card = document.createElement('div');
        card.className = 'card';

        let cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        card.appendChild(cardBody);

        let cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardBody.appendChild(cardTitle);

        let cardTitleLink = document.createElement('a');
        cardTitle.appendChild(cardTitleLink);

        let cardSubtitle = document.createElement('h6');
        cardSubtitle.className = 'card-subtitle';
        cardBody.appendChild(cardSubtitle);

        let cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardBody.appendChild(cardText);

        // Set the values of the element
        cardTitleLink.innerHTML = article.title;
        cardTitleLink.href = article.link;
        cardSubtitle.innerHTML = article.site;
        cardText.innerHTML = article.description;

        // Add the card to the cards div
        let cards = document.getElementById('cards')
        cards.appendChild(card)
    });
}