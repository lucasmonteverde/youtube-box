var router = require('express').Router(),
	Promise = require('bluebird'),
	helpers = require('../config/helpers'),
	User = require('../models/user'),
	Channel = require('../models/channel'),
	Video = require('../models/video'),
	Subscription = require('../models/subscription');

router.all('*', helpers.isLoggedIn);

router.get('/', function(req, res, next) {
	
	var data = [];
	
	return Promise.all([
		Subscription.find().lean(),
		Channel.count(),
		Video.count(),
		User.count()
	]).spread(function(subscriptions, channels, videos, users) {
		
		data.subscriptions = subscriptions;
		data.channels = channels;
		data.videos = videos;
		data.users = users;
		data.mostWatchedChannel = null;
		
		res.render('admin', data);
	}).catch(function(e) {
		return next(e);
	});
	
});
	
module.exports = router;