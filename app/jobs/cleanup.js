var Promise = require('bluebird'),
	moment = require('moment'),
	User = require('../models/user'),
	Subscription = require('../models/subscription'),
	Channel = require('../models/channel'),
	Video = require('../models/video');
	
	
var removeOldVideos = exports.removeOldVideos = function(){
	
	return Video.remove({
		published: { $lte: moment().subtract(1, 'month').toDate() }
	}).then(function(videos){
		
		console.log(videos.length);
		
		return videos;
	});
	
};