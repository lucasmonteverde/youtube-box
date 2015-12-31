var router = require('express').Router(),
	Promise = require('bluebird'),
	_ = require('lodash'),
	Feed = require('feed'),
	User = require('../models/user'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');
	
router.get('/:user', function(req, res, next) {
	
	var feed, user;
	
	if( ! req.params.user ) {
		next(new Error('User not defined'));
	}
	
	var query;
	
	if( ! req.user ){
		query = User.findOne({'youtube.id': req.params.user}).lean();
	}else{
		query = Promise.resolve(req.user);
	}
	
	query
		.then(function(item){
			user = item;
			
			return Subscription.findOne({user:user._id}).select('channels').lean();
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
			
			res.set('Content-Type', 'text/xml');
			
			res.send(feed.render());
			
		})
		.catch(function(e){
			console.error('feed error', e.error);
			
			next(e);
		});
});

module.exports = router;