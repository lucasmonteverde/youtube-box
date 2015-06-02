var Promise = require('bluebird'),
	moment = require('moment'),
	User = require('../models/user'),
	Subscription = require('../models/subscription'),
	Channel = require('../models/channel'),
	Video = require('../models/video');
	
	
var removeOldVideos = exports.removeOldVideos = function(){
	
	return Video.remove({
		published: { $lte: moment.utc().subtract(1, 'month').toDate() }
	}, function(err, result){
		if( err ) console.erro(err);
		
		console.log('result', result);
	});
	
};