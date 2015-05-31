var router = require('express').Router(),
	Promise = require('bluebird'),
	helpers = require('../config/helpers'),
	Cleanup = require('../jobs/cleanup'),
	User = require('../models/user'),
	Channel = require('../models/channel'),
	Video = require('../models/video'),
	Subscription = require('../models/subscription');

Promise.promisifyAll(Subscription);

router.all('*', helpers.isAdmin);

router.get('/', function(req, res, next) {
	
	var data = [];
	
	return Promise.all([
		User.count(),
		Channel.count(),
		Video.count(),
		mostWatchedChannels(5),
		mostWatchedVideos(5),
		mostActiveUser(5)
	])
	.spread(function(users, channels, videos, mostWatchedChannels, mostWatchedVideos, mostActiveUser) {
		data.users = users;
		data.channels = channels;
		data.videos = videos;
		
		data.mostWatched = {};
		data.mostWatched.channels = mostWatchedChannels;
		data.mostWatched.videos = mostWatchedVideos;
		
		data.mostActiveUser = mostActiveUser;

		res.render('admin', data);
	})
	.catch(function(e) {
		return next(e);
	});
	
});


router.get('/cleanup/videos', function(req, res, next){
	
	
	Cleanup.removeOldVideos();/*.then(function(){
		
		res.json('done');
		
	});*/
	
	
	res.json('done');
	
});

var mostWatchedChannels = function(total) {
	
	return Subscription.aggregateAsync([
		{ $project : { channels : 1, _id : -1 } }, //select fields
		{ $unwind: '$channels' }, // set subdocument as primary field
		{ $group: {
			_id: '$channels',
			count: { $sum: 1  }
		}},
		//{ $match : { count : { $gt : 1} } },
		{ $sort : { count : -1 } },
		{ $limit : total }
	]).then(function (channels) {
		return Channel.populate(channels, {path: '_id'});
	}).catch(function(e) {
		console.log(e);
	});
};

var mostWatchedVideos = function(total) {
	
	return Subscription.aggregateAsync([
		{ $project : { watched : 1, _id : -1 } }, //select fields
		{ $unwind: '$watched' }, // set subdocument as primary field
		{ $group: {
			_id: '$watched',
			count: { $sum: 1  }
		}},
		{ $match : { count : { $gt : 1} } },
		{ $sort : { count : -1 } },
		{ $limit : total }
	]).then(function (videos) {
		return Video.populate(videos, {path: '_id'});
	}).then(function (videos) {
		return Channel.populate(videos, {path: '_id.channel'});
	}).catch(function(e) {
		console.log(e);
	});
};

var mostActiveUser = function(total) {
	
	return Subscription
			.find({watched : {$gt: 1}})
			.limit(total)
			.sort('-watched')
			.populate('user');
};


module.exports = router;