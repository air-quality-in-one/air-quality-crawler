var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var SummarySchema = new Schema({
	level : {
    	type: String,
        trim: true
    },
    quality : {
    	type: String,
        trim: true
    },
    primary_pollutant : {
    	type: String,
        trim: true
    },
    affect : {
    	type: String,
        trim: true
    },
    action : {
    	type: String,
        trim: true
    },
    aqi : {
    	type: String,
        trim: true
    },
    pm_2_5 : {
    	type: String,
        trim: true
    },
    pm_10 : {
    	type: String,
        trim: true
    },
    co : {
    	type: String,
        trim: true
    },
    no2 : {
    	type: String,
        trim: true
    },
    o3 : {
    	type: String,
        trim: true
    },
    o3_8h : {
    	type: String,
        trim: true
    },
    so2 : {
    	type: String,
        trim: true
    }
});

module.exports = mongoose.model('Summary', SummarySchema);