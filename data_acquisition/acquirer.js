'use strict';

var CronJob = require('cron').CronJob;

var Collector = require('./collector');

var loading = false;

function Acquirer () {
	this.job = new CronJob('00 15 * * * *',
		loadData, null, false, 'Asia/Shanghai');
}

Acquirer.prototype.start = function () {
	var self = this;
	console.log("starting data acquirer ... ");
	self.job.start();
	console.log("successfully start data acquirer!");
}


function loadData() {
	var self = this;
	console.log("before load data ... ");
	if (loading == true) {
		console.log("other guy is loading data ... ");
		return;
	}

	loading = true;
	console.log("loading data ... ");

	var collector = new Collector();
	collector.on('success', function () {
		loading = false;
		console.log("success to load data ... ");
	});
	collector.on('error', function () {
		loading = false;
		console.log("fail to load data ... ");
	});
	collector.start();
}


exports.Acquirer = Acquirer;
