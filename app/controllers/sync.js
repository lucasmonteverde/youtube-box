var router = require('express').Router(),
	helpers = require('../config/helpers'),
	Sync = require('../jobs/sync');
	
router.all('*', helpers.isLoggedIn);

router.get('/subscriptions', function(req, res, next) {
	
	Sync.subscriptions(req.user.youtube.id);
	
	res.send('status done');
});

module.exports = router;