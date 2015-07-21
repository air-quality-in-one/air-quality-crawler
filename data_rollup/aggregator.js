'use strict';

var _ = require('lodash');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var AirQuality = require('../models/air_quality');
var AQIHistory = require('../models/aqi_history');

function Aggregator () {
	this.job = new CronJob('00 40 12 * * *',
		rollup, null, false, 'Asia/Shanghai');
}

Aggregator.prototype.start = function () {
	var self = this;
	console.log("starting data aggregator ... ");
	self.job.start();
	console.log("successfully start data aggregator!");
}


function rollup () {
	console.log("rolluping data ... ");
	AirQuality.loadDataXDaysBefore(1, function (error, qualityArray) {
		if (error) {
			console.log("Fail to load quality data 1 days before!");
			return;
		} else {
			var historyArray = rollup_quality_history(qualityArray);
			AQIHistory.create(historyArray, function (err, historyRecords) {
				if (err) {
					console.log("Fail to store AQIHistory : " + err);
					return;
				} else {
					console.log("Success to store AQIHistory!");
					return;
				}
			});
		}
	});
}

function rollup_quality_history (qualityArray) {
	var qualityMap = _.groupBy(qualityArray, 'city');
	var historyArray = _.map(qualityMap, function(quality, city) {
		var aqiArray = new Array(24);
		_.fill(aqiArray, "", 0, 24);
		var date = moment.tz(quality[0].time_update, "Asia/Shanghai").format('YYYY-MM-DD');
		_.each(_.sortBy(quality, 'time_update'), function (qualitySorted) {
			var time = moment.tz(qualitySorted.time_update, "Asia/Shanghai");
			var hour = time.hour();
			aqiArray[hour] = qualitySorted.summary.aqi;
		});
		var result = {
			city : city,
			report_date : date,
			aqis : aqiArray
		};
		return result;
	});
	//console.log("History Array : " + JSON.stringify(historyArray));
	return historyArray;
}

exports.Aggregator = Aggregator;
