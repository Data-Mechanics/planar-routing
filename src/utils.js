

function randomColor()
{

	var color = '', letters = '0123456';
	for (var i=0; i<6; i++)
	{
		color += letters[Math.floor(Math.random() * letters.length)];
	}

	return '#' + color;
}

Array.prototype.containsBinary = function(needle)
{
	/*
	Binary search. Array is assumed
	to be sorted in ascending order.
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
	/*
	Exhaustive array search.
	 */
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

	Returns how many times (mod 2) a line from the test point crosses the edges
	of the polygon. Even intersections (0) mean the point is outside the polygon,
	while odd intersections (1) indicate that the point is inside.
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





