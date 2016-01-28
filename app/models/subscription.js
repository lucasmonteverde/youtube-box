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
	unwatched: [{
		type: String,
		ref: 'Video'
	}],
	watched: [{
		_id: false,
		select: false,
		date: {
			type: Date,
			default: Date.now()
		},
		video: {
			type: String,
			ref: 'Video'
		}
	}]
	/*watched: [{
		type: String,
		ref: 'Video'
	}]*/
}, {collection: 'youtube-subscriptions'});

SubscriptionSchema.index({ user: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);