'use strict';

var router = require('express').Router(),
	_ = require('lodash'),
	helpers = require('../config/helpers'),
	Subscription = require('../models/subscription');

router.all('*', helpers.isLoggedIn);

router.get('/', function(req, res, next) {
	
	Subscription
		.findOne({user:req.user._id})
		.select('channels')
		.lean()
		.then(function(subscriptions){
			res.json( subscriptions );
		});
});

router.post('/watched', function(req, res, next) {
	
	if( ! req.body.video ) 
		return next(new Error('video is not set'));
		
	var videosId = req.body.video.split(',');
	
	console.log( videosId );
	
	var watched = _.map(videosId, function(id){
		return {
			video: id,
			date: Date.now()
		};
	});
	
	Subscription
		.update( { user: req.user._id }, {
			$push: { watched: { $each: watched } },
			$pullAll: { unwatched: videosId }
		})
		.then(function(){
			
			res.json({
				status: true,
				message: 'video watched saved!'
			});
			
		})
		.catch(function(e) {
			return next(e);
		});
	
	/*Subscription
		.findOneAndUpdate({user:req.user._id}, {
			$addToSet: { watched: { video : videosId, date: Date.now() } },
			$pullAll: { unwatched: videosId }
		},*/
	
	/*Subscription
		.findOne({user:req.user._id})
		.select('watched unwatched')
		.then(function(sub){
			
			if( sub ) {
				videosId.forEach(function(video){
					sub.watched.push({ 
						video : video,
						date: Date.now()
					});
					
					sub.unwatched.pull(video);
				});
				
				sub.watched = _.uniq(sub.watched, 'video');
				
				sub.save(function(err){
					if( err ) console.error(err);
					
					res.json({
						status: !err,
						message: err ? err : 'video watched saved!'
					});
				});
			}
			
		})
		.catch(function(e) {
			return next(e);
		});*/
		
});
	
module.exports = router;