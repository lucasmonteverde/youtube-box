'use strict';

var router = require('express').Router(),
	moment = require('moment'),
	_ = require('lodash'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');

var getVideos = function( req ) {

	var data = {
		sort: req.query.sort || req.cookies.sort,
		all: req.query.all || req.cookies.all
	};
	
	return Subscription
		.findOne({user:req.user._id})
		.select('channels unwatched')
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
				
			var query = Video.find();
			
			query.where('_id').in(subscription.unwatched);
					
			if( ! data.all ) {
				query.where('published').gte( moment().subtract(2, 'month').valueOf() );
			}
			
			if( req.query.search ) {
				query.where('title', new RegExp(req.query.search, 'i'));
				data.search = req.query.search;
			}
			
			if( req.query.channel ) {
				query.where('channel', req.query.channel);
				data.channel = req.query.channel;
			}else{
				query.where('channel').in(subscription.channels);
			}
			
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
				
				if( data.all ) {
					res.cookie('all', data.all, {
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

router.get('/watched', function(req, res, next) {
	
	
	Subscription
		.findOne({user:req.user._id})
		.select('channels watched')
		.populate({
			path: 'watched.video',
			options: {
				lean: true
			},
			populate: {
				path: 'channel',
				model: 'Channel',
				select: 'title thumbnail',
				options : {
					lean: true
				}
			}
		})
		.sort('-watched.date')
		.lean()
		.then(function(data){
			
			data.videos = _.chain(data.watched)
										.reverse()
										.filter('video')
										.map(function(watched){
											watched.video.watched = watched.date;
											return watched.video;
										})
										.uniqBy('_id')
										.slice(0, 100)
										.value();
			
			delete data.watched;
			
			res.format({
				json: function(){
					res.json( data );
				},
				html: function(){
					
					data.title = 'Watched';
		
					res.render('videos', data);
				}
			});
			
		});
	
})

module.exports = router;