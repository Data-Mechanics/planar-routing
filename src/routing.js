
var nodes = [];
var node_idx = 0;
var clicks = 0;
var route =
{
	"start": null,
	"end": null,
	"path": []
};


function updateRoute(current_list, route_dict)
{
	var found = false;
	var next_node;
	var idx;

	/*
	Some entries have more than one adjacent node that correspond the same path.
	If one of those nodes is the destination node, select it. Else, take either.
	 */
	for (var i = 1; i < current_list.length; i++)
	{
		if (current_list[i] === route_dict.end)
		{
			found = true;
			idx = i;
		}
	}

	if (found)
	{
		next_node = current_list[idx];
	}
	else
	{
		if (current_list.length > 2)
		{
			for (var j = 1; j < current_list.length; j++)
			{
				if ( !route_dict.path.containsUnsorted(current_list[j]) )
				{
					next_node = current_list[j];
				}
			}
		}
		else
		{
				next_node = current_list[1];
		}
	}

	return next_node;
}


function router(route_dict, nodes)
{
	/*
	Follow adjacent nodes from routing table until destination is reached.
	 */

	var current_node = route_dict.start;

	while (current_node !== route_dict.end)
	{
		for (var i = 0; i < nodes[current_node].dat.properties.next.length; i++)
		{
			/*
			First check all nodes in next set to rule out destination nodes that are vertices.
			 */
			var current_list;
			var next_node;
			var destCoords = nodes[route_dict.end].dat.coordinates;

			if (nodes[current_node].dat.properties.next[i][0].containsUnsorted(route_dict.end))
			{
				current_list = nodes[current_node].dat.properties.next[i];
				next_node = updateRoute(current_list, route_dict);

				/*
				Check if path already includes this node (eliminates cycles).
				 */
				if (!route_dict.path.containsUnsorted(next_node))
				{
					route_dict.path.push(next_node);
					current_node = next_node;
					break;
				}
			}
			/*
			Then check if the destination nodes is inside the polygon represented by the vertices.
			 */
			else
			{
				var nextLength = nodes[current_node].dat.properties.next[i][0].length;

				if (nextLength > 2)
				{

					var nextCoords = [];
					for (var j = 0; j < nextLength; j++)
					{
						var vertNode = nodes[current_node].dat.properties.next[i][0][j];
						nextCoords.push(nodes[vertNode].dat.coordinates);
					}

					if (nextCoords.containsPoly(destCoords))
					{
						current_list = nodes[current_node].dat.properties.next[i];
						next_node = updateRoute(current_list, route_dict);

						/*
						Check if path already includes this node (eliminates cycles).
						 */
						if (!route_dict.path.containsUnsorted(next_node))
						{
							route_dict.path.push(next_node);
							current_node = next_node;
							break;
						}
					}
				}
			}
		}
		if (i === nodes[current_node].dat.properties.next.length && route_dict.path.containsUnsorted(current_node))
		{
			alert("Destination is unreachable from that point.");
			break;
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

		console.log(clicks);

		nodes[node.nodeid].vis.setStyle({fillColor: "#F00FF0", color: "#F00FF0"});

		if (clicks === 0)
		{
			route.start = node.nodeid;
		}
		else if (clicks === 1)
		{
			route.end = node.nodeid;
			route.path.push(route.start);
			var path = router(route, nodes);

			for (var k = 0; k < route.path.length; k++)
			{
				nodes[path[k]].vis.setStyle({fillColor: "#FF0000", color: "#FF0000"});
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