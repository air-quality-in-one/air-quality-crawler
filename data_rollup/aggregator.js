'use strict';

var CronJob = require('cron').CronJob;

function Aggregator () {
	this.job = new CronJob('00 30 00 * * *', 
		loadData, null, false, 'Asia/Shanghai');
}

Aggregator.prototype.start = function () {
	var self = this;
	console.log("aggregating data ... ");
	self.job.start();
}

exports.Aggregator = Aggregator;