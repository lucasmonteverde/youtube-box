'use strict';

const router = require('express').Router(),
	_ = require('lodash'),
	moment = require('moment'),
	mongoose = require('mongoose'),
	Subscription = mongoose.model('Subscription'),
	Video = mongoose.model('Video');

function getVideos( req ) {

	let data = {
		sort: req.query.sort || req.cookies.sort,
		all: req.query.all || req.cookies.all
	};
	
	return Subscription
		.findOne({
			user: req.user._id
		})
		.select('channels videos')
		.populate({
			path: 'channels', 
			select: 'title thumbnail',
			options : {
				sort: 'title',
				lean: true
			} 
		})
		.lean()
		.then(subscription => {
			
			if ( ! subscription ) return [];

			//console.log(subscription);
				
			data.channels = subscription.channels;

			/* var news = ( subscription.videos || [] )
				.filter(video => ! video.watched)
				.map(video => video._id ); */
			
			const query = Video.find();
			
			//query.where('_id').in( news );
			
			if ( ! data.all ) {
				query.where('published').gte( moment().subtract(2, 'month').valueOf() );
			}
			
			if ( req.query.search ) {
				query.where('title', new RegExp(req.query.search, 'i'));
				data.search = req.query.search;
			}
			
			if ( req.query.channel ) {
				query.where('channel', req.query.channel);
				data.channel = req.query.channel;
			} else {
				query.where('channel').in(subscription.channels);
			}
			
			query.sort(data.sort ? data.sort : '-published');
			query.limit(100);
			
			return query.lean();
		})
		.then(videos => {
			
			//manual populate
			_.each(videos, function(video) {
				video.channel = _.find(data.channels, { _id: video.channel });
			});
			
			data.videos = videos;
			
			//req.app.emit('sync', 'query done');
			
			return data;
		});
};

router.get('/', (req, res, next) => {
	
	if( req.isAuthenticated() ){
		
		getVideos(req)
			.then(data => {
				
				//TODO: Cookie options management
				if ( data.sort ) {
					res.cookie('sort', data.sort, {
						maxAge: 2592000000,
						httpOnly: true
					});
				}
				
				if ( data.all ) {
					res.cookie('all', data.all, {
						maxAge: 2592000000,
						httpOnly: true
					});
				}
				
				res.format({
					json() {
						res.json( data.videos );
					},
					html() {
						data.title = 'Videos';
						
						res.render('videos', data);
					}
				});
				
			})
			.catch(err => {
				console.error(err);
				return next(err);
			});
		//data.videos = [];
		
		//res.render('videos', data);
	
	} else {
		res.render('index', {
			layout: 'landing',
			message: req.session.messages
		});
	}
	
});

router.get('/watched', (req, res, next) => {
	
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
		.then(data => {
			
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
				json() {
					res.json( data );
				},
				html() {
					data.title = 'Watched';
		
					res.render('videos', data);
				}
			});
			
		})
		.catch(err => {
			console.error(err);
			return next(err);
		});
	
});

module.exports = router;