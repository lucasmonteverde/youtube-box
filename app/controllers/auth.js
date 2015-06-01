var router = require('express').Router(),
	passport = require('passport'),
	helpers = require('../config/helpers'),
	Video = require('../models/video'),
	Subscription = require('../models/subscription');

router.get('/youtube', passport.authenticate('youtube'));

router.get('/youtube/callback', passport.authenticate('youtube', {
	successRedirect: '/auth/callback',
	failureRedirect: '/auth/callback'
}));

router.get('/callback', function(req, res){
	res.render('callback', {layout: false});
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

router.get('/profile', helpers.isLoggedIn, function(req, res, next){
	
	var data = {};
	
	Subscription
		.findOne({user: req.user._id})
		.lean()
		.then(function(subscription){
			
			data.channels = subscription.channels.length;
			data.watched = subscription.watched.length;
				
			return Video.count({channel: {$in: subscription.channels}});
			
		}).then(function(videos){
			
			data.videos = videos;
			
			console.log('data', data);
			
			res.render('profile', data);
		})
		.catch(function(e){
			console.error('profile error', e.error);
			
			next(e);
		});
	
});

module.exports = router;