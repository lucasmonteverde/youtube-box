'use strict';

var moment = require('moment'),
	_ = require('lodash'),
	User = require('../models/user'),
	Subscription = require('../models/subscription'),
	Channel = require('../models/channel'),
	Video = require('../models/video');
	
exports.removeOldVideos = function(){
	
	return Video.remove({
		published: { $lte: moment().subtract(1, 'month').toISOString() }
	});
	
};

exports.migrationWatched = function(user){
	
	return Subscription.findOne({
		user: user
	}).then(function(sub){
		
		console.log(sub);
		
		if( sub ) {
			sub.watched.forEach(function(video){
				sub.watches.push({
					video : video,
					date: Date.now()
				});
				
				sub.unwatched.pull(video);
			});
			
			sub.watches = _.uniq(sub.watches, 'video');
		}
		
		return sub.save();
	});
	
};