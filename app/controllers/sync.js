'use strict';

var router = require('express').Router(),
	helpers = require('../config/helpers'),
	Sync = require('../jobs/sync'),
	Cleanup = require('../jobs/cleanup');
	
router.all('*', helpers.isLoggedIn);

router.get('/subscriptions', function(req, res) {
	
	Sync.subscriptions(req.user);
	
	res.send('subscriptions done');
});

router.get('/channels', function(req, res) {
	
	Sync.updateChannels();
	
	res.send('channels done');
});

router.get('/cleanup/videos', function(req, res) {
	
	Cleanup.unwatchVideos(req.user);
	
	res.send('channels old done');
});


module.exports = router;