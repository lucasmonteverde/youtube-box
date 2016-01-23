'use strict';

var mongoose = require('mongoose');

var VideoSchema = new mongoose.Schema({
	_id: String,
	title: String,
	description: String,
	published: Date,
	duration: Number,
	views: Number,
	likes: Number,
	dislikes: Number,
	definition: String,
	channel: {
		type: String,
		ref: 'Channel'
	}
}, {
	collection: 'youtube-videos',
	_id: false,
	versionKey: false
});

module.exports = mongoose.model('Video', VideoSchema);