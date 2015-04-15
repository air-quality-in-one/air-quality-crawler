'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var _ = require('lodash');
var Summary = require('./quality_summary');
var Station = require('./station_detail');
var DateUtil = require('../utils/date_util');

var AirQualitySchema = new Schema({
    city: {
        type: String,
        required: true,
        trim: true
    },
    time_update : {
    	type: Date
    },
    unit : {
    	type: String,
        trim: true
    },
    summary : {
    	type: ObjectId,
		ref: 'Summary',
        required: true
    },
    stations: [{
		type: ObjectId,
		ref: 'Station'
	}],
});

AirQualitySchema.pre('remove', function (next) {
    var airQuality = this;
    console.log("before remove : " + JSON.stringify(airQuality));
    console.log("try to remove summary: " + airQuality.summary);
    Summary.findOneAndRemove({"_id" : airQuality.summary}, function (err) {
        if (err) {
            console.log("fail to remove summary: " + airQuality.summary);
        } else {
            console.log("success to remove summary: " + airQuality.summary);
        }
        console.log("try to remove stations: " + JSON.stringify(airQuality.stations));
        var done = _.after(airQuality.stations.length, function() {
            console.log('done remove stations!');
            return next();
        });
        _.each(airQuality.stations, function (station) {
            Station.findOneAndRemove({"_id" : station}, function (err) {
                if (err) {
                    console.log("fail to remove station: " + station);
                } else {
                    console.log("success to remove station: " + station);
                }
                done();
            });
        });
    });
});

AirQualitySchema.static('loadDataXDaysBefore', function(day, callback) {
    var startTime = DateUtil.getStartOfXDayBefore(day);
    var endTime = DateUtil.getStartOfXDayBefore(day-1);
    console.log("Try to load AirQuality from " + startTime + " to " + endTime);
    var query = {
        "time_update" : {
            "$gte" : startTime,
            "$lt" : endTime
        }
    };
    this.find(query).populate('summary', 'aqi -_id')
        .select('city time_update summary -_id')
        .exec(function(err, qualityArray) {
        if (err) {
            return callback(err);
        } else {
            console.log("Loaded AirQuality : " + JSON.stringify(qualityArray));
            return callback(null, qualityArray);
        }
    });
});


AirQualitySchema.static('removeDataXDaysBefore', function(day, callback) {
    var startTime = DateUtil.getStartOfXDayBefore(day);
    var endTime = DateUtil.getStartOfXDayBefore(day-1);
    console.log("Try to remove AirQuality from " + startTime + " to " + endTime);
    var query = {
        "time_update" : {
            "$gte" : startTime,
            "$lt" : endTime
        }
    };
    this.find(query).exec(function (err, qualityArray) {
        console.log("Try to remove AirQuality : " + JSON.stringify(qualityArray));
        var done = _.after(qualityArray.length, function() {
            console.log('done remove AirQuality list!');
            return callback(null);
        });
        _.each(qualityArray, function (quality) {
            quality.remove(function(err) {
                if (err) {
                    console.log("Fail to remove AirQuality : " + err);
                    
                } else {
                    console.log("Success to remove AirQuality!");
                }
                done();
            });
        });
        
    });
});

module.exports = mongoose.model('AirQuality', AirQualitySchema);