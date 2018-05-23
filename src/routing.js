
var nodes = [];
var node_idx = 0;
var clicks = 0;
var route =
{
	"start": null,
	"end": null,
	"path": []
};

Array.prototype.contains = function(needle)
{

	var min = 0;
	var max = this.length - 1;
	var guess;

	while (min <= max) {
		guess = Math.floor((min + max) / 2);

		if (this[guess] === needle) {
			return true;
		}
		else {
			if (this[guess] < needle) {
				min = guess + 1;
			}
			else {
				max = guess - 1;
			}
		}
	}

	return false;
};

function router(route_dict, nodes)
{
	/*
	TODO -- check for cycles when next.length < adjacent.length --
	 */

	var current_node = route_dict.start;

	while (current_node !== route_dict.end)
	{
		for (var i = 0; i < nodes[current_node].dat.properties.next.length; i++)
		{
			if (nodes[current_node].dat.properties.next[i][0].contains(route_dict.end))
			{
				var current_list = nodes[current_node].dat.properties.next[i];
				var next_node;
				var found = false;
				var idx;

				for (var j = 1; j < current_list.length; j++)
				{
					if (current_list[j] === route_dict.end)
					{
						found = true;
						idx = j;
					}
				}

				if (found)
				{
					next_node = current_list[idx];
				}
				else
				{
					next_node = current_list[1];
				}

				route_dict.path.push(next_node);
				current_node = next_node;
				break;
			}
		}
	}

	return route_dict.path;
}

function pointLayer(feature, latlng)
{

	var node = L.circleMarker
	(
		latlng,
		{radius:4, weight:0.1, fillColor:"#FFFFFF", color:"#FFFFFF", opacity:1, fillOpacity:1}
	);

	nodes.push({'dat':feature, 'vis':node, 'idx': node_idx});
	node.nodeid = node_idx;

	node_idx++;

	node.on('click', function()
	{

		nodes[node.nodeid].vis.setStyle({fillColor: "#FF0000", color: "#FF0000"});

		if (clicks === 0)
		{
			route.start = node.nodeid;
		}
		else if (clicks === 1)
		{
			route.end = node.nodeid;
			route.path.push(route.start);
			var path = router(route, nodes);
			console.log(path);

			for (var k = 0; k < route.path.length; k++)
			{
				nodes[route.path[k]].vis.setStyle({fillColor: "#FF0000", color: "#FF0000"});
			}

			route.path = [];
		}
		else
		{
			for (var i = 0; i < nodes.length; i++)
			{
				if (i !== node.nodeid)
				{
					nodes[i].vis.setStyle({fillColor: "#FFFFFF", color: "#FFFFFF"});
				}
			}

			clicks = 0;
			route.start = node.nodeid;
			route.end = null;
		}

		clicks++;

	});

	return node;
}