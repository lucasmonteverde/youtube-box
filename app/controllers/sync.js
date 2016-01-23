'use strict';

var router = require('express').Router(),
	helpers = require('../config/helpers'),
	Sync = require('../jobs/sync');
	
router.all('*', helpers.isLoggedIn);

router.get('/subscriptions', function(req, res) {
	
	Sync.subscriptions(req.user);
	
	res.send('subscriptions done');
});

router.get('/channels', function(req, res) {
	
	Sync.updateChannels();
	
	res.send('channels done');
});

module.exports = router;