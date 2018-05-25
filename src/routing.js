
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
	/*
	Determine if an element is in an array. Array
	is assumed to be sorted in ascending order.
	 */

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

Array.prototype.containsUnsorted = function(needle)
{

	for (var i = 0; i < this.length; i++)
	{
		if (this[i] === needle)
		{
			return true;
		}
	}

	return false;
};

Array.prototype.containsPoly = function(needle)
{
	/*
	Determine if an element is within a polygon represented
	by the points of an array. Points are assumed to be in
	either clockwise or counterclockwise order.
	 */

	var numVert = this.length;
	var x = needle[0];
	var y = needle[1];
	var inside = false;

	for (var i = 0, j = numVert - 1; i < numVert; j = i++)
	{
		var xi = this[i][0], yi = this[i][1];
		var xj = this[j][0], yj = this[j][1];

		var intersect = ( (yi > y) !== (yj > y) ) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect)
		{
			inside = !inside;
		}
	}

	return inside;
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

	/*
	TODO - still producing cycles in some cases. Because polygons overlap, the routing
	function will get stuck jumping between two polygons in certain cases. Need to fix
	by checking first whether the adjacency set for a given next_list is already contained
	in the current path before using it.
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
				/*
				TODO - check for cycles here
				 */
				current_list = nodes[current_node].dat.properties.next[i];
				next_node = updateRoute(current_list, route_dict);

				if (!route_dict.path.containsUnsorted(next_node))
				{
					route_dict.path.push(next_node);
					current_node = next_node;
					break;
				}
			}
			/*
			Then test if the destination nodes is inside the polygon represented by the vertices.
			 */
			else
			{
				/*
				TODO - check for cycles here
				 */
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