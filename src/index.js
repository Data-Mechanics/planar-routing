//var L = require('leaflet');
var T = require('./tile.js');
var G = require('./geoJson.js');
var D = require('./tableData');


L.tileLayer
(
	"https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
	{maxZoom:18, attribution:'', id:'mapbox.light'}
).addTo(leaflet);


