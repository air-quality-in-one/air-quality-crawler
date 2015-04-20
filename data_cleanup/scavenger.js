'use strict';

var _ = require('lodash');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var AirQuality = require('../models/air_quality');
var AQIHistory = require('../models/aqi_history');

function Scavenger() {
	this.job = new CronJob('00 30 01 * * *', 
		cleanup, null, false, 'Asia/Shanghai');
}

Scavenger.prototype.start = function () {
	var self = this;
	console.log("cleanning up data ... ");
	self.job.start();
}


function cleanup () {
	console.log("cleanning up data ... ");
	AirQuality.removeDataXDaysBefore(2, function (error) {
		if (error) {
			console.log("Fail to clean up quality data 3 days before!");
			return;
		} else {
			console.log("Success to clean up quality data 3 days before!");
			return;
		}
	});
}


exports.Scavenger = Scavenger;