var router = require('express').Router(),
	passport = require('passport');

router.get('/youtube', passport.authenticate('youtube'));

router.get('/youtube/callback', passport.authenticate('youtube', {
	successRedirect: '/auth/callback',
	failureRedirect: '/auth/callback'
}));

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

router.get('/callback', function(req, res){
	res.render('callback', {layout: false});
});

module.exports = router;