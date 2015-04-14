'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var AQIHistorySchema = new Schema({
    city: {
        type: String,
        required: true,
        trim: true
    },
    report_date : {
    	type: String,
        required: true,
        trim: true
    },
    history: [{
		type: String,
        trim: true
	}],
});

module.exports = mongoose.model('AQIHistory', AQIHistorySchema);