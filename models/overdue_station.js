var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var OverdueStationSchema = new Schema({
    station_id : {
        type: ObjectId,
        ref: 'Station',
        required: true
    }
});

module.exports = mongoose.model('OverdueStation', OverdueStationSchema);