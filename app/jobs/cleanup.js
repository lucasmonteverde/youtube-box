'use strict';

var moment = require('moment'),
	Subscription = require('models/subscription'),
	User = require('models/user'),
	Channels = require('models/channel'),
	Video = require('models/video');
	
exports.removeOldVideos = function() {
	
	return Video.remove({
		published: { $lte: moment().subtract(1, 'year').toISOString() }
	});
	
};

exports.removeVideos = function() {

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
	.then(function(result) {
		return result && result[0].channels;
	})
	.then(function( channels ) {
		console.log('channels', channels.length);

		return Video.remove({
			channel: { $nin: channels }
		});
	})
	.then(function() {
		console.log('videos removed');

		return 'done';
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
	.then(function() {
		console.log('channels removed');

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