'use strict';

var cheerio = require('cheerio');

function Parser () {
	console.log("initializing Parser ... ");
};

Parser.parseAllCities = function (data, callback) {
	console.log(data);
	var $ = cheerio.load(data);
	// body > div.container > div.span12.cities > div.all > div.bottom > ul
	var cssPath = "body > div.container > div.span12.cities > div.all > div.bottom > ul > div:nth-child(2)";
	$(cssPath).each(function(i, elem) {
		console.log("div is " + $(this).text());
	});
	callback(null);
};

module.exports = Parser;