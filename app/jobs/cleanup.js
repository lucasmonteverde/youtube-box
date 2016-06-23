'use strict';

var moment = require('moment'),
	_ = require('lodash'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');
	
exports.removeOldVideos = function(){
	
	return Video.remove({
		published: { $lte: moment().subtract(1, 'month').toISOString() }
	});
	
};

exports.unwatchVideos = function(user){
	
	return Subscription.findOne({
		user: user
	})
	.select('channels unwatched')
	.populate('unwatched', 'channel')
	.then(function(sub){
		
		if( sub ) {
			sub.unwatched = _.filter(sub.unwatched, function(video){
				return sub.channels.indexOf(video.channel) !== -1;
			});
		}
		
		return sub.save();
	});
	
};


exports.subscriptionVideosUpgrade = function(){

	return Subscription.find()
		.select('watched unwatched')
		.then(function(subscriptions){
			return subscriptions;
		})
		.each(function(sub) {

			sub.videos = [];

			_.each(sub.unwatched, function(video) {

				sub.videos.push({
					_id: video
				});

			});

			_.each(sub.watched, function(video) {

				sub.videos.push({
					_id: video.video,
					watched: video.date
				});

			});

			sub.unwatched = [];

			sub.watched = [];

			return sub.save();
		})
		.then(function(){
			return 'done';
		});

};