var L = require('leaflet');
var U = require('./utils.js');

function pointLayer(feature, latlng)
{

	var node = L.circleMarker(
		latlng,
		{radius:4, weight:0.1, fillColor:"#666666", color:"#666666", opacity:1, fillOpacity:1}
	);

	var colors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'];
	var nodes = [];

	node.on('click', function() {
		for (var i = 0; i < feature.properties.next.length; i++)
		{
			for (var j = 0; j < feature.properties.next[i].length; j++)
			{
				nodes[feature.properties.next[i][j]].vis.setStyle({fillColor:colors[i], color:colors[i]});
			}
		}
	});
	nodes.push({'dat':feature, 'vis':node});
	return node;
}

module.exports =
	{
		addGeoLayer: function(obj, leaflet)
		{
			L.geoJson(obj,
				{
				filter: function (feature, layer) { return true; },
				style: function () { return {"color": U.randomColor()}; },
				onEachFeature: U.onEachFeature,
				pointToLayer: pointLayer
				}
				).addTo(leaflet);
		}
	};


