'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	_id: String,
	title: String,
	description: String,
	published: {
		type: Date,
		index: 1
	},
	duration: Number,
	views: {
		type: Number,
		index: 1
	},
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

module.exports = mongoose.model('Video', schema);