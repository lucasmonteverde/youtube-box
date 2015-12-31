var router = require('express').Router(),
	helpers = require('../config/helpers'),
	Sync = require('../jobs/sync');
	
router.all('*', helpers.isLoggedIn);

router.get('/subscriptions', function(req, res, next) {
	
	Sync.subscriptions(req.user);
	
	res.send('subscriptions done');
});

router.get('/channels', function(req, res, next) {
	
	Sync.updateChannels();
	
	res.send('channels done');
});

module.exports = router;