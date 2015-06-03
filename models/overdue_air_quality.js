var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var OverdueAirQualitySchema = new Schema({
    air_quality_id : {
        type: ObjectId,
        ref: 'AirQuality',
        required: true
    }
});


function cursor (_start,_limit,_callback){
  //初始化数据定义
  var start,limit,flag,len;
  //初始化起始位置
  start = !_start || _start < 0 ? 0 : _start;
  //初始化分页数量
  limit = !_limit || _limit < 1 ? 1 : _limit;
  //使用Model执行分页查询
  OverdueAirQualitySchema.find().skip(start).limit(limit).exec(function(err,docs){
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
        cursor(start + docs.length,limit);
      }
    });
  });
}

OverdueAirQualitySchema.static('removeAirQuality', cursor);



module.exports = mongoose.model('OverdueAirQuality', OverdueAirQualitySchema);