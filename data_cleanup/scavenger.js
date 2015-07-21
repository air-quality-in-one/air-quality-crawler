'use strict';

var _ = require('lodash');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var AirQuality = require('../models/air_quality');
var Station = require('../models/station_detail');
var Summary = require('../models/quality_summary');
var AQIHistory = require('../models/aqi_history');

var Queue = require('../utils/job_queue');


function Scavenger() {
	this.job = new CronJob('00 45 13 * * *', 
		cleanup, null, false, 'Asia/Shanghai');
}

Scavenger.prototype.start = function () {
	var self = this;
	console.log("starting data scavenger ... ");
	self.job.start();
	console.log("successfully start data scavenger!");
}


function cleanup () {
	console.log("cleanning up data ... ");
	/*AirQuality.removeDataXDaysBefore(2, function (error) {
		if (error) {
			console.log("Fail to clean up quality data 2 days before!");
			return;
		} else {
			console.log("Success to clean up quality data 2 days before!");
			return;
		}
	});*/

	AirQuality.prepareDataXDaysBefore(2, function (error, result) {
		if (error) {
			console.log("Fail to prepare quality data 2 days before!");
			return;
		} else {
			console.log("Success to prepare quality data 2 days before!");
      		//removeOverdueAirQuality(result);
      		/*
      		doRemoval(result, function (err) {
      			if (err) {
      				console.log("Fail to clean up quality data 2 days before!");
      			} else {
      				console.log("Success to clean up quality data 2 days before!");
      			}
      		});
*/
		}
	});
}


function doRemoval(airQualities, done) {
	console.log("Removing overdue air quality ... ");
	var airQualityIds = [];
	var summaryIds = [];
	var stationIds = [];
	_.each(airQualities, function (airQuality) {
		airQualityIds.push(airQuality._id);
		summaryIds.push(airQuality.summary);
		stationIds.push.apply(stationIds, airQuality.stations);
	});
	console.log("airQualityIds length : " + airQualityIds.length);
	console.log("summaryIds length : " + summaryIds.length);
	console.log("stationIds length : " + stationIds.length);

	Station.remove({ id: { $in: stationIds } }, function (err) {
		if (err) {
			console.log("Fail to remove stations!");
			return done(err);
		} else {
			Summary.remove({ id: { $in: summaryIds } }, function (err) {
				if (err) {
					console.log("Fail to remove summary!");
					return done(err);
				} else {
					AirQuality.remove({ id: { $in: airQualityIds } }, function(err) {
						if (err) {
							console.log("Fail to remove AirQuality!");
							return done(err);
						} else {
							return done(null);
						}
					});
				}
			});
		}
	});
}

exports.Scavenger = Scavenger;