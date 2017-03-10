'use strict';

var router = require('express').Router(),
	helpers = require('config/helpers'),
	Sync = require('jobs/sync'),
	Cleanup = require('jobs/cleanup');
	
router.all('*', helpers.isLoggedIn);

router.get('/subscriptions', function(req, res) {
	
	Sync.subscriptions(req.user);
	
	res.send('subscriptions done');
});

router.get('/channels', function(req, res) {
	
	Sync.updateChannels();
	
	res.send('channels done');
});

router.get('/cleanup/channels', function(req, res) {
	
	Cleanup.removeChannels().then(function( data ){
		res.json(data);
	});
	
});

router.get('/cleanup/videos', function(req, res) {
	
	Cleanup.removeOldVideos().then(function( ){
		res.send('videos upgrade done');
	});
});

router.get('/cleanup/subscription', function(req, res) {
	
	Cleanup.subscriptionVideosUpgrade();
	
	res.send('subscription upgrade done');
});

module.exports = router;