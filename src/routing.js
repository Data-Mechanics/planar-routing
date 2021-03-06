
var nodes = [];
var nodeIdx = 0;
var clicks = 0;
var route =
{
	"start": null,
	"end": null,
	"path": []
};


function updateRoute(adjacencyList, routeDict)
{
	/*
	Select next node in route, given a list of adjacent nodes.
	 */
	var found = false;
	var nextNode;
	var idx;

	/*
	Some entries have more than one adjacent node that correspond the same path.
	If one of those nodes is the destination node, select it. Else, take either.
	 */
	for (var i = 1; i < adjacencyList.length; i++)
	{
		if (adjacencyList[i] === routeDict.end)
		{
			found = true;
			idx = i;
		}
	}

	if (found)
	{
		nextNode = adjacencyList[idx];
	}
	else
	{
		if (adjacencyList.length > 2)
		{
			for (var j = 1; j < adjacencyList.length; j++)
			{
				if ( !routeDict.path.containsUnsorted(adjacencyList[j]) )
				{
					nextNode = adjacencyList[j];
				}
			}
		}
		else
		{
				nextNode = adjacencyList[1];
		}
	}

	return nextNode;
}


function router(routeDict, nodes)
{
	/*
	Follow adjacent nodes from routing table until destination is reached.
	 */

	/*
	TODO - route making fails when it goes through a set of nodes that are clustered close together,
	probably due to several polygons overlapping one another. Need to handle cases where the route
	closes in on itself and runs out of places to go (since it can't select nodes that it already
	selected in order to prevent cycles). One way to do this would be detect it and go back to the
	most recent 'safe' spot, and continue building the path from there while intentionally not taking
	the incorrect steps it took before.
	 */

	/*
	TODO - related to above - resulting path is not optimal is most cases, because several turns from
	a given node represent the same destination node. One way to choose the most optimal path would be
	to build each path when the possible paths diverge in this way, and select the shortest path when
	all are done being built.
	 */

	/*
	TODO - might also just be easiest to recompute the polygon vertices such that each nextList contains
	the minimal number of vertices such that it doesn't overlap with the other polygons in the nextList,
	but that algorithm would have to be written from scratch.
	 */

	/*
	TODO - could also check to see if the length of currentNode's nextList is 1, which would
	indicate that there is only one step that can be taken from currentNode. Then take that step
	and ignore all the polygon testing stuff.
	 */

	var currentNode = routeDict.start;
	var foundNext;

	while (currentNode !== routeDict.end)
	{

		foundNext = false;

		for (var i = 0; i < nodes[currentNode].dat.properties.next.length; i++)
		{
			/*
			First check all nodes in next set to rule out destination nodes that are vertices.
			 */
			var adjacencyList;
			var nextNode;
			var destCoords = nodes[routeDict.end].dat.coordinates;

			if (nodes[currentNode].dat.properties.next[i][0].containsUnsorted(routeDict.end))
			{
				adjacencyList = nodes[currentNode].dat.properties.next[i];
				nextNode = updateRoute(adjacencyList, routeDict);

				/*
				Check if path already includes this node (eliminates cycles).
				 */
				if (!routeDict.path.containsUnsorted(nextNode))
				{
					foundNext = true;
					routeDict.path.push(nextNode);
					currentNode = nextNode;
					break;
				}
			}
			/*
			Then check if the destination nodes is inside the polygon represented by the vertices.
			 */
			else
			{
				var nextLength = nodes[currentNode].dat.properties.next[i][0].length;

				if (nextLength > 2)
				{

					var nextCoords = [];
					for (var j = 0; j < nextLength; j++)
					{
						var vertNode = nodes[currentNode].dat.properties.next[i][0][j];
						nextCoords.push(nodes[vertNode].dat.coordinates);
					}

					if (nextCoords.containsPoly(destCoords))
					{
						adjacencyList = nodes[currentNode].dat.properties.next[i];
						nextNode = updateRoute(adjacencyList, routeDict);

						/*
						Check if path already includes this node (eliminates cycles).
						 */
						if (!routeDict.path.containsUnsorted(nextNode))
						{
							foundNext = true;
							routeDict.path.push(nextNode);
							currentNode = nextNode;
							break;
						}
					}
				}
			}
		}

		if (!foundNext)
		{
			alert("Destination is unreachable from that point.");
			break;
		}

	}

	return routeDict.path;
}

function pointLayer(feature, latlng)
{

	var node = L.circleMarker
	(
		latlng,
		{radius:4, weight:0.1, fillColor:"#FFFFFF", color:"#FFFFFF", opacity:1, fillOpacity:1}
	);

	nodes.push({'dat':feature, 'vis':node, 'idx': nodeIdx});
	node.nodeid = nodeIdx;

	nodeIdx++;


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