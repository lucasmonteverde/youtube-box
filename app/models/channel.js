'use strict';

var mongoose = require('mongoose');

var ChannelSchema = new mongoose.Schema({
	_id: String,
	title: String,
	description: String,
	thumbnail: String,
	updatedDate: Date
}, {
	collection: 'youtube-channels',
	_id: false,
	versionKey: false
});

module.exports = mongoose.model('Channel', ChannelSchema);