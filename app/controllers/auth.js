'use strict';

const router = require('express').Router(),
	passport = require('passport'),
	helpers = require('config/helpers'),
	Video = require('models/video'),
	Subscription = require('models/subscription');

router.get('/youtube', passport.authenticate('youtube'));

router.get('/youtube/callback', passport.authenticate('youtube', {
	successRedirect: '/auth/callback',
	failureRedirect: '/auth/callback'
}));

router.get('/callback', (req, res) => {
	res.render('callback', {layout: false});
});

router.get('/logout', (req, res) => {
	req.logout();
	req.session.destroy();
	res.redirect('/');
});

router.get('/profile/:id', helpers.isLoggedIn, (req, res, next) => {
	
	let data = {};
	
	//var userId = ( req.user.admin && req.params.id ) ? req.params.id : req.user._id;
	
	Subscription
		.findOne({user: req.user._id})
		.lean()
		.then(subscription => {
			
			data.subscription = subscription;
				
			return Video.count({channel: {$in: subscription.channels}});
		})
		.then(videos => {
			
			data.title = 'Profile';
			
			data.videos = videos;
			
			console.log('data', data);
			
			res.render('profile', data);
		})
		.catch(e => {
			console.error('profile error', e.error);
			
			next(e);
		});
	
});

module.exports = router;