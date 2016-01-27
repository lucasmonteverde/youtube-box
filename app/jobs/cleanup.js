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