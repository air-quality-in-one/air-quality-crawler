'use strict';

var cheerio = require('cheerio');
var _ = require('lodash');
var moment = require('moment-timezone');

var PollutantDataType = {
	AQI : 1,
	PM_2_5 : 2,
	PM_10 : 3,
	CO :4,
	NO2 : 5,
	O3 : 6,
	O3_8H : 7,
	SO2 : 8
};

function Parser () {
	console.log("initializing Parser ... ");
};

Parser.parseNewlyUpdateTime = function (data, callback) {
	var $ = cheerio.load(data);
	var newlyUpdateTime = parseUpdateTime($);
	//console.log("newlyUpdateTime : " + newlyUpdateTime);
	return callback(null, newlyUpdateTime);
}

Parser.parseAllCities = function (data, callback) {
	// console.log(data);
	var $ = cheerio.load(data);
	var hotCities = [];
	var hotPath = "body > div.container > div.span12.cities > div.hot > div.bottom > ul > li > a";
	$(hotPath).each(function(i, elem) {
		var city = $(elem).attr('href').slice(1);
		//console.log("HotCity is " + JSON.stringify(city));
		hotCities.push(city);
	});
	var cssPath = "body > div.container > div.span12.cities > div.all > div.bottom > ul > div:nth-child(2) > li > a";
	var citySet = [];
	$(cssPath).each(function(i, elem) {
		var spell = $(elem).attr('href').slice(1);
		var name = $(elem).text();
		var hotspot = (_.indexOf(hotCities, spell) != -1);
		var city = {
			spell : spell,
			name : name,
			hotspot : hotspot
		};
		//console.log("City is " + JSON.stringify(city));
		citySet.push(city);
	});
	callback(null, citySet);
};

Parser.parseCityDetail = function (data, callback) {
	var $ = cheerio.load(data);
	var summary = parseCitySummary($);
	var stations = parseCityStationDetail($);
	callback(null, summary, stations);
};

function parseCitySummary (data) {
	var levelAndQuality = parseLevelAndQuality(data);
	var updateTime = parseUpdateTime(data);
	var unit = parseUnit(data);
	var aqi = parsePollutantValue(data, PollutantDataType.AQI);
	var pm_2_5 = parsePollutantValue(data, PollutantDataType.PM_2_5);
	var pm_10 = parsePollutantValue(data, PollutantDataType.PM_10);
	var co = parsePollutantValue(data, PollutantDataType.CO);
	var no2 = parsePollutantValue(data, PollutantDataType.NO2);
	var o3 = parsePollutantValue(data, PollutantDataType.O3);
	var o3_8h = parsePollutantValue(data, PollutantDataType.O3_8H);
	var so2 = parsePollutantValue(data, PollutantDataType.SO2);
	var primaryPollutant = parsePrimaryPollutant(data);
	var healthAffect = parseHealthAffect(data);
	var healthAction = parseHealthAction(data);

	var summary = {
		level : levelAndQuality.level,
		quality : levelAndQuality.quality,
		time_update : updateTime,
		primary_pollutant : primaryPollutant,
		affect : healthAffect,
		action : healthAction,
		unit : unit,
		aqi : aqi,
		pm_2_5 : pm_2_5,
		pm_10 : pm_10,
		co : co,
		no2 : no2,
		o3 : o3,
		o3_8h : o3_8h,
		so2 : so2
	}
	return summary;
}

function parseCityStationDetail (data) {
	var $ = data;
	var stations = [];
	var stationPath = "#detail-data > tbody > tr";
	$(stationPath).each(function(i, elem) {
		var stationValue = [];
		var child = $(this).children('td').each(function (index, element) {
			stationValue.push($(this).text());
		});
		if (stationValue.length != 11) {
			console.log("data is shifted!");
		}

		var stationDetail = {
			name : stationValue[0],
			aqi : stationValue[1].replace("_", ""),
			quality : stationValue[2].replace("_", ""),
			primary_pollutant : stationValue[3].replace("_", ""),
			pm_2_5 : stationValue[4].replace("_", ""),
			pm_10 : stationValue[5].replace("_", ""),
			co : stationValue[6].replace("_", ""),
			no2 : stationValue[7].replace("_", ""),
			o3 : stationValue[8].replace("_", ""),
			o3_8h : stationValue[9].replace("_", ""),
			so2 : stationValue[10].replace("_", "")
		}
		stations.push(stationDetail);
		
	});
	return stations;
}

function parseLevelAndQuality(data) {
	var $ = data;
	var cssPath = "body > div.container > div.span12.avg > div:nth-child(1) > div.level";
	var levelAndQuality = $(cssPath).text().trim();
	var idx1 = levelAndQuality.indexOf("（");
	var idx2 = levelAndQuality.indexOf("）");
	var level = levelAndQuality.substring(0, idx1);
	var quality = levelAndQuality.substring(idx1+1, idx2);
	return {level : level, quality : quality};
}

function parseUpdateTime(data) {
	var $ = data;
	var cssPath = "body > div.container > div.span12.avg > div:nth-child(2) > div.live_data_time";
	var updateTime = $(cssPath).text().trim();
	var idx = updateTime.indexOf("：");
	var time = updateTime.substring(idx+1, updateTime.length);
	var timeValue = moment.tz(time, "Asia/Shanghai").format()
	return timeValue;
}

function parseUnit(data) {
	var $ = data;
	var cssPath = "body > div.container > div.span12.avg > div:nth-child(2) > div.live_data_unit";
	var unit = $(cssPath).text().trim();
	var idx = unit.indexOf("：");
	var unitValue = unit.substring(idx+1, unit.length);
	return unitValue;
}

function parsePollutantValue(data, pollutantDataType) {
	var $ = data;
	var cssPath = "body > div.container > div.span12.avg > div.span12.data > div:nth-child(" 
		+ pollutantDataType + ") > div.value";
	var value = $(cssPath).text().trim();
	return value;
}

function parsePrimaryPollutant(data) {
	var $ = data;
	var cssPath = "body > div.container > div.span12.avg > div.span12.caution > div.primary_pollutant > p";
	var pollutant = $(cssPath).text().trim().replace("-</>", "");
	var idx = pollutant.indexOf("：");
	var primaryPollutant = pollutant.substring(idx+1, pollutant.length).trim();
	return primaryPollutant;
}

function parseHealthAffect(data) {
	var $ = data;
	var cssPath = "body > div.container > div.span12.avg > div.span12.caution > div.affect > p";
	var affect = $(cssPath).text().trim();
	var idx = affect.indexOf("：");
	var healthAffect = affect.substring(idx+1, affect.length).trim();
	return healthAffect;
}

function parseHealthAction(data) {
	var $ = data;
	var cssPath = "body > div.container > div.span12.avg > div.span12.caution > div.action > p";
	var action = $(cssPath).text().trim();
	var idx = action.indexOf("：");
	var healthAction = action.substring(idx+1, action.length).trim();
	return healthAction;
}

module.exports = Parser;