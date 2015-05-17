var router = require('express').Router(),
	Feed = require('feed'),
	User = require('../models/user'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');
	
router.get('/:user', function(req, res, next) {
	
	var feed, user;
	
	if( ! req.params.user ) {
		next(new Error('user not defined'));
	}
	
	/*if( req.user ) {
		query = Subscription.findOne({user:req.user._id}).populate('user');
	}*/
	
	User
		.findOne({'youtube.id': req.params.user})
		.then(function(item){
			user = item;
			
			return Subscription
						.findOne({user:user._id});
						
		}).then(function(subscription){
			
			feed = new Feed({
				title: 'New Subscription Videos for userId: ' + user.youtube.id,
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
						
		}).each(function(video){
			
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
			
		}).then(function(){
			
			res.set('Content-Type', 'text/xml');
			
			res.send(feed.render());
			
		});
});

module.exports = router;