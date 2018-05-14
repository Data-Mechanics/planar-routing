
module.exports =
	{
	randomColor: function()
	{
		var color = '', letters = '0123456';
		for (var i=0; i<6; i++)
		{
			color += letters[Math.floor(Math.random() * letters.length)];
		}
		return '#' + color;
	},

	onEachFeature: function(feature, layer)
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
	};



