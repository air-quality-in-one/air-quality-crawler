'use strict';

var _ = require('lodash');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var AirQuality = require('../models/air_quality');
var AQIHistory = require('../models/aqi_history');

var Queue = require('../utils/job_queue');

var OverdueAirQuality = require('../models/overdue_air_quality');

function Scavenger() {
	this.job = new CronJob('00 32 15 * * *', 
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
      removeOverdueAirQuality(result);
		}
	});
}

function removeOverdueAirQuality(airQualities) {
  var queue = new Queue('remove_overdue_air_quality_job');
  _.each(airQualities, function (airQuality) {

    //console.log("City : " + JSON.stringify(city.spell));
    queue.createJob({aqid : airQuality._id}, function (err, document) {
      if (err) {
        console.log("Error when create job for " + airQuality._id);
      } else {
        //console.log("Success to create job : " + JSON.stringify(document));
      }
    });
  });
}


exports.Scavenger = Scavenger;