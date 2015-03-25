'use strict';

var cheerio = require('cheerio');
var _ = require('underscore');

function Parser () {
	console.log("initializing Parser ... ");
};

Parser.parseAllCities = function (data, callback) {
	// console.log(data);
	var $ = cheerio.load(data);
	var hotCities = [];
	var hotPath = "body > div.container > div.span12.cities > div.hot > div.bottom > ul > li > a";
	$(hotPath).each(function(i, elem) {
		var city = $(elem).attr('href').slice(1);
		console.log("HotCity is " + JSON.stringify(city));
		hotCities.push(city);
	});
	var cssPath = "body > div.container > div.span12.cities > div.all > div.bottom > ul > div:nth-child(2) > li > a";
	var citySet = [];
	$(cssPath).each(function(i, elem) {
		var spell = $(elem).attr('href').slice(1);
		var name = $(elem).text();
		var hotspot = (_.indexOf(hotCities, spell) != -1);
		var city = {
			spell : spell,
			name : name,
			hotspot : hotspot
		};
		//console.log("City is " + JSON.stringify(city));
		citySet.push(city);
	});
	callback(null, citySet);
};

module.exports = Parser;