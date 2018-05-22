

function randomColor()
{

	var color = '', letters = '0123456';
	for (var i=0; i<6; i++)
	{
		color += letters[Math.floor(Math.random() * letters.length)];
	}

	return '#' + color;
}







