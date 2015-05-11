var router = require('express').Router(),
	passport = require('passport');

router.get('/youtube', passport.authenticate('youtube', { 
	scope: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/userinfo.email'],
	access_type: 'offline'
}));

router.get('/youtube/callback', passport.authenticate('youtube', { 
	successRedirect: '/',
	failureRedirect: '/'
}));

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

module.exports = router;