'use strict';

var CronJob = require('cron').CronJob;

function Aggregator () {
	this.job = new CronJob('00 40 00 * * *', 
		null, null, false, 'Asia/Shanghai');
}

Aggregator.prototype.start = function () {
	var self = this;
	console.log("aggregating data ... ");
	self.job.start();
}

function rollup () {
	console.log("rolluping data ... ");
}

exports.Aggregator = Aggregator;