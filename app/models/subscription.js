'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		unique: true
	},
	channels: [{
		type: String,
		ref: 'Channel'
	}],
	videos: [{
		_id: String,
		select: false,
		watched: Date
	}]
}, {
	collection: 'youtube-subscriptions'
});

module.exports = mongoose.model('Subscription', schema);