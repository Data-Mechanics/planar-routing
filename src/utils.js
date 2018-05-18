

	function randomColor()
	{
		var color = '', letters = '0123456';
		for (var i=0; i<6; i++)
		{
			color += letters[Math.floor(Math.random() * letters.length)];
		}
		return '#' + color;
	}

	/*
	function onEachFeature(feature, layer)
	{
		if (feature.properties)
		{
			var popupContent = "<p>" + feature.coordinates + ".</p>";

			if (feature.properties.popupContent)
			{
				popupContent += feature.properties.popupContent;
			}
			layer.bindPopup(popupContent);
		}
	}
	*/

	function pointLayer(feature, latlng)
	{

	var node = L.circleMarker
	(
		latlng,
		{radius:4, weight:0.1, fillColor:"#666666", color:"#666666", opacity:1, fillOpacity:1}
	);

	var colors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFF000'];

	nodes.push({'dat':feature, 'vis':node, 'idx': node_idx});
	node.nodeid = node_idx;

	node_idx++;

	node.on('click', function()
	{

		nodes[node.nodeid].vis.setStyle({fillColor: "#FFFFFF", color: "#FFFFFF"});

		if (clicks == 0)
		{
			route.start = node.nodeid;
		}
		else if (clicks == 1)
		{
			route.end = node.nodeid;
			// *** routing function here ***
		}
		else
		{
			clicks = 0;
			route.start = node.nodeid;
			route.end = 999;
		}

		clicks++;

		console.log(node.nodeid);

		/*
		console.log(feature);
		console.log(node);
		console.log(nodes);
	  */

		for (var i = 0; i < feature.properties.next.length; i++)
		{
			for (var j = 0; j < feature.properties.next[i].length; j++)
			{
				nodes[feature.properties.next[i][j]].vis.setStyle({fillColor:colors[i], color:colors[i]});
				//console.log(nodes[feature.properties.next[i][j]].dat.coordinates);
			}
		}

		/*
		console.log(route.start);
		console.log(route.end);
		*/

	});



	return node;

	}





