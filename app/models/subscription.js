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
	watched: [{
		type: String,
		ref: 'Video'
	}]
}, {collection: 'youtube-subscriptions'});

module.exports = mongoose.model('Subscription', SubscriptionSchema);