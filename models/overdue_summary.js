var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var OverdueSummarySchema = new Schema({
    summary_id : {
        type: ObjectId,
        ref: 'Summary',
        required: true
    }
});

module.exports = mongoose.model('OverdueSummary', OverdueSummarySchema);