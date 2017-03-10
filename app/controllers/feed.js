'use strict';

var router = require('express').Router(),
	Promise = require('bluebird'),
	Feed = require('feed'),
	cache = require('config/cache').cache,
	User = require('models/user'),
	Subscription = require('models/subscription'),
	Video = require('models/video');
	
Promise.promisifyAll(cache);

var buildFeed = function( req ){
	
	var feed, user, query;
	
	if( ! req.user ) {
		query = User.findOne({'youtube.id': req.params.user}).lean();
	}else{
		query = Promise.resolve(req.user);
	}
	
	return query
		.then(function(item){
			user = item;
			
			return Subscription
						.findOne({user:user._id})
						.select('channels')
						.lean();
		})
		.then(function(subscription){
			
			feed = new Feed({
				title: 'New Subscription Videos for user: ' + user.name,
				description: 'Youtube subscriptions feed',
				link: req.protocol + '://' + req.hostname + req.originalUrl,
				//image: '',
				author: {
					name: 'Youtube Box',
					link: 'http://youtube-box.herokuapp.com'
				},
				feed: true
			});
			
			return Video.find({channel: {$in: subscription.channels}})
						.limit(30)
						.sort('-published')
						.populate('channel')
						.lean();
						
		})
		.then(function(videos){
			return videos;
		})
		.each(function(video){
			
			feed.addItem({
				title: video.title,
				//description: video.description,
				content: video.description,
				link: 'https://www.youtube.com/watch?v=' + video._id,
				date: video.published,
				image: 'https://i.ytimg.com/vi/' + video._id + '/hqdefault.jpg',
				author: [{
					name: video.channel.title,
					link: 'https://www.youtube.com/channel/' + video.channel._id
				}]
			});
			
		})
		.then(function(){
			user = null;
			return feed.render();
		});
	
};

router.get('/:user', function(req, res, next) {
	
	if( ! req.params.user ) {
		next(new Error('User not defined'));
	}
	
	cache
		.getAsync(req.originalUrl)
		.then(function(value){
			return value || buildFeed(req);
		})
		.then(function( feed ){
			
			res.set('Content-Type', 'text/xml');
			
			res.send(feed);
			
			cache.set(req.originalUrl, feed, 1800);
			
			feed = null;
		})
		.catch(function(e){
			console.error('feed error', e.error);
			
			return next(e);
		});
});

module.exports = router;