'use strict';

var _ = require('lodash');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var AirQuality = require('../models/air_quality');
var AQIHistory = require('../models/aqi_history');

var OverdueAirQuality = require('../models/overdue_air_quality');

function Scavenger() {
	this.job = new CronJob('00 20 14 * * *', 
		cleanup, null, false, 'Asia/Shanghai');
}

Scavenger.prototype.start = function () {
	var self = this;
	console.log("starting data scavenger ... ");
	self.job.start();
	console.log("successfully start data scavenger!");
}


function cleanup () {
	console.log("cleanning up data ... ");
	/*AirQuality.removeDataXDaysBefore(2, function (error) {
		if (error) {
			console.log("Fail to clean up quality data 2 days before!");
			return;
		} else {
			console.log("Success to clean up quality data 2 days before!");
			return;
		}
	});*/

	AirQuality.prepareDataXDaysBefore(2, function (error) {
		if (error) {
			console.log("Fail to prepare quality data 2 days before!");
			return;
		} else {
			console.log("Success to prepare quality data 2 days before!");
			//cursor(0, 10, function(overdue_air_quality) {
				//console.log("Success to remove : " + overdue_air_quality);
			//});
		}
	});
}


function cursor (_start,_limit,_callback){
  //初始化数据定义
  var start,limit,flag,len;
  //初始化起始位置
  start = !_start || _start < 0 ? 0 : _start;
  //初始化分页数量
  limit = !_limit || _limit < 1 ? 1 : _limit;

  console.log("From " + _start + " to " + (_start + _limit));
  //使用Model执行分页查询
  OverdueAirQuality.find().skip(start).limit(limit).exec(function(err,docs){
    //缓存长度
    len = docs.length;
    //如果没有查询到，证明已经查询完毕
    if(len === 0){
      console.log('遍历结束');
    }
    //初始化循环结束标记
    flag = 0;
    //遍历
    docs.forEach(function(doc){
      //如果有执行函数就执行
      if(_callback && toString.call(_callback) === '[object Function]'){
        _callback(doc);
      }
      //如果循环到末尾，则迭代
      if(len == ++flag){
      	//console.log("Try to call recursively method!");
        cursor(start + docs.length,limit, _callback);
      }
    });
  });
}


exports.Scavenger = Scavenger;