var router = require('express').Router(),
	Promise = require('bluebird'),
	Feed = require('feed'),
	User = require('../models/user'),
	Video = require('../models/video');
	
router.get('/:user', function(req, res) {
	
	var feed;
	
	User.findById(req.user._id).then(function(user){
		
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
		
		return Video.find({channel: {$in: user.channels}})
					.limit(30)
					.sort({published: -1})
					.populate('channel')
					.lean()
					.exec();
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