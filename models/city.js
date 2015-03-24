'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CitySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    spell: {
        type: String,
        required: true,
        trim: true
    }
});

CitySchema.method('toJSON', function() {
    var city = this.toObject();
    return {
        id: city._id,
        spell: city.spell,
        name: city.name
    };
 });

module.exports = mongoose.model('City', CitySchema);