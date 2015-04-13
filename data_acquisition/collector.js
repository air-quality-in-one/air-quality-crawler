'use strict';
var needle = require('needle');
var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var moment = require('moment-timezone');

var City = require('../models/city');
var Station = require('../models/station_detail');
var Summary = require('../models/quality_summary');
var AirQuality = require('../models/air_quality');

var Parser = require('./parser');
var Queue = require('./job_queue');

var reloadCity = true;

var options = {
  //proxy : 'http://10.64.240.214:3128',
  decode : false,
  parse : true
}


function Collector () {
	console.log("initializing Collector ... ");
	this.lastUpdateTime = moment.tz("2000-01-01T00:00:00.000Z", "Asia/Shanghai");
	//this.lastUpdateTime = moment.tz("2015-04-13T17:00:00+08:00", "Asia/Shanghai");
	EventEmitter.call(this);
};

util.inherits(Collector, EventEmitter);

Collector.prototype.start = function () {
	var self = this;
	check_need_load_data(function (error, newlyUpdateTime) {
		if (error) {
			self.emit("error");
		} else {
			var time = moment.tz(newlyUpdateTime, "Asia/Shanghai");
			if (time.isAfter(self.lastUpdateTime)) {
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
			} else {
				console.log("No Update Data from Web!");
				self.emit("success");
			}
		}
	});
	

}

function check_need_load_data (callback) {
	var url = "http://pm25.in/beijing";
	needle.get(url, options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(response.body);
			return Parser.parseNewlyUpdateTime(response.body, callback);
		} else {
			console.log("Fail to load status data from web");
			console.log(error + response);
			return callback('error');
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
						console.log("Fail to remove all cities");
						return callback(err);
					}
					City.create(result, function (error) {
						if (error) {
							console.log("Fail to add all cities");
							return callback(error);
						}
						return callback(null, result);
					});
				});
			});
		} else {
			console.log("Fail to load_cities_from_web");
			console.log(error + response);
			callback('error');
		}
	});
}

function load_city_detail (cities, callback) {
	var queue = new Queue('load_air_quality_job');
	_.each(cities, function (city) {

		console.log("City : " + JSON.stringify(city.spell));
		queue.createJob({spell : city.spell}, function (err, document) {
			if (err) {
				console.log("Error when create job for " + city.spell);
			} else {
				console.log("Success to create job : " + JSON.stringify(document));
			}
		});
	});

	queue.onJob(function (job, done) {
		console.log("Processing job : " + JSON.stringify(job));
		//done(null);
		load_detail(job.spell, done);
	}).onFinished(function () {
		console.log("Finish all jobs");
		callback(null);
	}).start();
	
}

function load_detail(city, done) {
	var url = "http://pm25.in/" + city;
	console.log("Loading detail of City : " + city);
	needle.get(url, options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			//console.log("Detail is " + response.body);
			Parser.parseCityDetail(response.body, 
				function (err, summary, stations, history) {
					if (err) {
						done("parse error");
					} else {
						//console.log("Summary is " + JSON.stringify(summary));
						//console.log("Stations is " + JSON.stringify(stations));
						Station.create(stations, function (err, stationArray) {
							if (err) {
								return done("db error");
							}

							var stationIdArray = _.map(stationArray, function (detail) {
								return detail.id;
							});
							//console.log("Result is " + JSON.stringify(stationArray));
							//console.log("Id is " + JSON.stringify(stationIdArray));
							Summary.create(summary, function (err, summaryRecord) {
								if (err) {
									return done("db error");
								}

								//console.log("summaryRecord is " + JSON.stringify(summaryRecord));
								var airQuality = {
									city : city,
									time_update : summary.time_update,
									unit : summary.unit,
									summary : summaryRecord.id,
									stations : stationIdArray
								};
								AirQuality.create(airQuality, function (err, qualityRecord) {
									if (err) {
										return done("db error");
									}
									//console.log("qualityRecord is " + JSON.stringify(qualityRecord));
									return done(null);
								});
							});
							
							
						});
						
					}
			});
		} else {
			console.log("load error");
			return done("load error");
		}
	});
}

module.exports = Collector;