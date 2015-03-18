'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Collector () {
	console.log("initializing Collector ... ");
	EventEmitter.call(this);
};

util.inherits(Collector, EventEmitter);

Collector.prototype.start = function () {
	var self = this;
	// load data
	// success
	var success = true;
	if (success) {
		self.emit("success");
	} else {
		self.emit("error");
	}
}

module.exports = Collector;