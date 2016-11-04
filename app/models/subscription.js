'use strict';

var mongoose	= require('mongoose'),
	Schema		= mongoose.Schema;

var SubscriptionSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
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
}, {collection: 'youtube-subscriptions'});

SubscriptionSchema.index({ user: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);