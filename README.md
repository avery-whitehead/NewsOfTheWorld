## News of the World

News of the World lets you search for what's currently happening around the globe - from the biggest cities to the smallest settlements. Try clicking around the map to see what you can find!

## What is this and how does it work?

News of the World is an interactive world map that pops up with local headlines for a given location.

It uses LeafletJS to display the map, LocationIQ for reverse geocoding and the Google News RSS feed to grab the news

Clicking on the map fires an event that returns the latitude and longitude of where you clicked. These coordinates are translated into an address, which is then searched for in the news.

You can read the development blog for this project (which goes into a lot more detail) at [https://james-whitehead.github.io/blog](https://james-whitehead.github.io/blog)

## Examples

Desktop app:

[!desktop map](https://raw.githubusercontent.com/james-whitehead/NewsOfTheWorld/master/examples/desktop_map.jpg)

[!desktop news](https://raw.githubusercontent.com/james-whitehead/NewsOfTheWorld/master/examples/desktop_news.jpg)

Mobile app:

[!mobile news and app](https://raw.githubusercontent.com/james-whitehead/NewsOfTheWorld/master/examples/mobile.png)