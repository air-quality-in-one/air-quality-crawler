'use strict';

var moment = require('moment-timezone');

var getStartOfXDayBefore = function (day) {
	return moment.tz("Asia/Shanghai")
		.subtract(day, 'days')
		.startOf('day')
		.format();
}

exports.getStartOfXDayBefore = getStartOfXDayBefore;