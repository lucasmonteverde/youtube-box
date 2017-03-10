'use strict';

var router = require('express').Router(),
	helpers = require('config/helpers'),
	Subscription = require('models/subscription');

router.all('*', helpers.isLoggedIn);

router.get('/', function(req, res, next) {
	
	Subscription
		.findOne({user:req.user._id})
		.select('channels videos')
		.lean()
		.then(function(subscriptions){
			res.json( subscriptions );
		})
		.catch(function(e) {
			return next(e);
		});
});

router.get('/all', function(req, res, next) {
	
	Subscription
		.find()
		.select('user')
		.sort('lastLogin')
		.populate('user')
		.lean()
		.then(function(subscriptions) {
			res.json( subscriptions );
		})
		.catch(function(e) {
			return next(e);
		});
});

router.post('/watched', function(req, res, next) {
	
	if( ! req.body.video ) {
		return next(new Error('video is not set'));
	}
		
	var videosId = req.body.video.split(',');
	
	console.log( videosId );

	Subscription
		.update( {
			'user': req.user._id,
			'videos._id': { $in: videosId }
		}, { $set: {
			'videos.$.watched': Date.now()
		}})
		.then(function(){
			
			res.json({
				status: true,
				message: 'video watched saved!'
			});
			
		})
		.catch(function(e) {
			return next(e);
		});
		
});
	
module.exports = router;