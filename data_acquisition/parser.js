'use strict';

var cheerio = require('cheerio');

function Parser () {
	console.log("initializing Parser ... ");
};

Parser.parseAllCities = function (data, callback) {
	// console.log(data);
	var $ = cheerio.load(data);
	var cssPath = "body > div.container > div.span12.cities > div.all > div.bottom > ul > div:nth-child(2) > li > a";
	var citySet = [];
	$(cssPath).each(function(i, elem) {
		var city = {
			spell : $(elem).attr('href').slice(1),
			name : $(elem).text()
		};
		//console.log("City is " + JSON.stringify(city));
		citySet.push(city);
	});
	callback(null, citySet);
};

module.exports = Parser;