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
	
	return Promise.props({
		users: User.count(),
		channels: Channel.count(),
		videos: Video.count(),
		mostWatchedChannels: mostWatchedChannels(5),
		mostWatchedVideos: mostWatchedVideos(5),
		mostActiveUser: mostActiveUser(5)
	})
	.then(function( result ) {
		res.render('admin', result);
	})
	.catch(function(e) {
		return next(e);
	});
	
});


router.get('/cleanup/videos', function(req, res, next){
	
	Cleanup.removeOldVideos().then(function(){
		
		res.json('done');
		
	});
	
});

router.get('/cleanup/watched', function(req, res, next){
	
	Cleanup.migrationWatched(req.user._id).then(function(){
		
		res.json('done');
		
	});
	
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