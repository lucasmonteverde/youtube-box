'use strict';

var moment = require('moment'),
	Subscription = require('models/subscription'),
	User = require('models/user'),
	Channels = require('models/channel'),
	Video = require('models/video');
	
exports.removeOldVideos = function() {
	
	return Video.remove({
		published: { $lte: moment().subtract(1, 'month').toISOString() }
	});
	
};

exports.removeChannels = function() {

	return Subscription.aggregate([
		{ $project: {
			_id: 0,
			channels: 1 }
		},
		{ $unwind: '$channels' },
		{ $group: {
			_id: 0,
			channels: {
				$push: '$channels'
			}
		}},
	])
	.exec()
	.then(function(result) {
		return result && result[0].channels;
	})
	.then(function( channels ) {
		console.log('channels', channels.length);

		return Channels.remove({
			_id: { $nin: channels }
		});
	})
	.then(function(channels) {
		console.log('channels removed', channels);

		return 'done';
	});

};

exports.subscriptionVideosUpgrade = function(){

	return Subscription.find()
		.select('watched unwatched')
		.then(function(subscriptions){
			return subscriptions;
		})
		.each(function(sub) {

			sub.unwatched = sub.watched = undefined;

			return sub.save();
		})
		.then(function(){
			return 'done';
		});

};

exports.deleteUser = function( users ) {

	return Subscription.find({
			user: { $in: users }
		})
		.select('user')
		.then(function(subscriptions){
			return subscriptions;
		})
		.each(function(sub) {

			console.log('sub', sub);

			User.findByIdAndRemove( sub.user ).exec();

			return sub.remove();
		})
		.then(function(data) {
			return console.log(data);
		});

};