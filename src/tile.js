
var L = require('leaflet');

module.exports =
	{
		addTileLayer: function(leaflet)
		{
			L.tileLayer
			(
				"https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
				{maxZoom:18, attribution:'', id:'mapbox.light'}
			).addTo(leaflet);
		}
	};