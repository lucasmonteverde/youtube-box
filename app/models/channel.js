'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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

module.exports = mongoose.model('Channel', schema);