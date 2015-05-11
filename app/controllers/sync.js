var router = require('express').Router(),
	Sync = require('../jobs/sync');
	
function isLoggedIn(req, res, next) {
	return req.isAuthenticated() ? next() : res.redirect('/');
}

router.all('*', isLoggedIn);

router.get('/subscriptions', function(req, res, next) {
	
	Sync.subscriptions(req.user.youtube.id);
	
	res.send('status done');
});

module.exports = router;