'use strict';
var needle = require('needle');
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var City = require('../models/city');
var Parser = require('./parser');
var Queue = require('./job_queue');

var reloadCity = false;

var options = {
  decode : false,
  parse : true
}


function Collector () {
	console.log("initializing Collector ... ");
	EventEmitter.call(this);
};

util.inherits(Collector, EventEmitter);

Collector.prototype.start = function () {
	var self = this;
	load_all_cities(function (error, cities) {
		if (error) {
			self.emit("error");
		} else {
			load_city_detail(cities, function (err) {
				if (err) {
					self.emit("error");
				} else {
					self.emit("success");
				}
			});
		}
	});

}

function load_all_cities (callback) {
	if (reloadCity) {
		load_cities_from_web(callback);
	} else {
		load_cities_from_db(callback);
	}
	
}

function load_cities_from_db(callback) {
	City.findAll(callback);
}

function  load_cities_from_web(callback) {
	var url = "http://pm25.in/";
	needle.get(url, options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(response.body);
			Parser.parseAllCities(response.body, function (err, result) {
				if (err) {
					return callback(err);
				}
				//console.log("Result : " + JSON.stringify(result));
				City.remove(function (err) {
					if (err) {
						return callback(err);
					}
					City.create(result, function (error) {
						if (error) {
							return callback(error);
						}
						return callback(null, result);
					});
				});
			});
		} else {
			console.log(response.statusCode);
			callback('error');
		}
	});
}

function load_city_detail (cities, callback) {
	var queue = new Queue('load_city_detail');
	for (var i = 0; i < cities.length; i++) {
		var city = cities[i];
		console.log("City : " + JSON.stringify(city.spell));
		queue.createJob({spell : city.spell}, function (err, document) {
			if (err) {
				console.log("Error when create job for " + city.spell);
			} else {
				console.log("Success to create job : " + JSON.stringify(document));
			}
		});
	}
		/*
		var url = "http://pm25.in/" + city.spell;
		console.log("Loading detail of City : " + city.spell);
		needle.get(url, options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("Detail is " + response.body);
			} else {
				callback('error');
			}
		});
		*/

	queue.onJob(function (job, done) {
		console.log("Processing job : " + JSON.stringify(job));
		done(null);
	}).onFinished(function () {
		console.log("Finish all jobs");
		callback(null);
	}).start();
	
}

module.exports = Collector;