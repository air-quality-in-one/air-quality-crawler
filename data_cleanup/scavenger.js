'use strict';

var _ = require('lodash');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var AirQuality = require('../models/air_quality');
var AQIHistory = require('../models/aqi_history');

var OverdueAirQuality = require('../models/overdue_air_quality');

function Scavenger() {
	this.job = new CronJob('00 55 14 * * *', 
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

	AirQuality.prepareDataXDaysBefore(2, function (error) {
		if (error) {
			console.log("Fail to prepare quality data 2 days before!");
			return;
		} else {
			console.log("Success to prepare quality data 2 days before!");
			//cursor(0, 10, function(overdue_air_quality) {
				//console.log("Success to remove : " + overdue_air_quality);
			//});
  removeOverdueAirQuality();
		}
	});
}

function removeOverdueAirQuality() {
  OverdueAirQuality.find().exec(function(err,docs){
    console.log("find " + docs.length + " overdue air quality!");
  });
}


exports.Scavenger = Scavenger;