'use strict';

var router = require('express').Router(),
	moment = require('moment'),
	_ = require('lodash'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');

var getVideos = function( req ) {

	var data = {
		sort: req.query.sort || req.cookies.sort
	};
	
	return Subscription
		.findOne({user:req.user._id})
		.populate({
			path: 'channels', 
			select: 'title thumbnail',
			options : {
				sort: 'title',
				lean: true
			} 
		})
		.lean()
		.then(function(subscription) {
			
			if( ! subscription ) return [];
				
			data.channels = subscription.channels;
				
			var query = Video.find({
							_id: {$in: subscription.unwatched}
						});
					
			if( ! req.query.all ) {
				query.where('published').gte( moment().subtract(2, 'month').valueOf() );
			} else {
				data.all = req.query.all;
			}
			
			if( req.query.search ) {
				query.where('title', new RegExp(req.query.search, 'i'));
				data.search = req.query.search;
			}
			
			if( req.query.channel ) {
				query.where('channel', req.query.channel);
				data.channel = req.query.channel;
			}/*else{
				query.where('channel', {$in: subscription.channels});
			}*/
			
			query.sort(data.sort ? data.sort : '-published');
			
			return query.lean();
		})
		.then(function(videos) {
			
			_.each(videos, function(video) {
				video.channel = _.find(data.channels, { _id: video.channel });
			});
			
			data.videos = videos;
			
			//req.app.emit('sync', 'query done');
			
			return data;
		});
};

router.get('/', function(req, res, next) {
	
	if( req.isAuthenticated() ){
		
		getVideos(req)
			.then(function( data ) {
				
				//TODO: Cookie options management
				if( data.sort ) {
					res.cookie('sort', data.sort, {
						maxAge: 2592000000,
						httpOnly: true
					});
				}
				
				res.format({
					json: function(){
						res.json( data.videos );
					},
					html: function(){
						
						data.title = 'Videos';
						
						res.render('videos', data);
					}
				});
				
			})
			.catch(function(err) {
				console.error(err);
				return next(err);
			});
		//data.videos = [];
		
		//res.render('videos', data);
	
	}else{
		
		res.render('index', {
			layout: 'landing',
			message: req.session.messages
		});
	}
	
});

module.exports = router;