'use strict';

var moment = require('moment-timezone');

var Collector = require('../data_acquisttion/collector');

var now = moment.tz("Asia/Shanghai").format();
console.log("[" + now +"] : loading air quality ... ");

var collector = new Collector();
collector.on('success', function () {
	console.log("success to load data ... ");
});
collector.on('error', function () {
	console.log("fail to load data ... ");
});
collector.start();

