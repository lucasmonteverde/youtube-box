var router = require('express').Router(),
	moment = require('moment'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');

router.get('/', function(req, res) {
	
	var data = {
		title: 'Youtube Box',
		sort: req.query.sort || req.cookies.sort,
		message: req.session.messages
	};
	
	if( req.isAuthenticated() ){
		
		videos(req, res, data);
	
	}else{
		res.render('login', data);
	}
	
});

var videos = function(req, res, data) {

	Subscription
		.findOne({user:req.user._id})
		.then(function(subscription){
			
			if(!subscription)
				return [];
				
			var query = Video.find({
						_id: {$nin: subscription.watched},
						channel: {$in: subscription.channels},
						//published: {$gte: moment().subtract(1,'day')}
					});
					
			if( req.query.filter ){
				query.where('title', new RegExp(req.query.filter,'i'));
			}
			
			//TODO: rewrite swith case to map
			switch(data.sort){
				case 'old':
					query.sort('published');
					break;
				case 'views':
					query.sort('-views');
					break;
				case 'duration':
					query.sort('-duration');
					break;
				case 'new':
				default:
					query.sort('-published');
					break;
			}
			
			return query.populate('channel');
		})
		.then(function(videos){
			
			res.format({
				json: function(){
					res.json(videos);
				},
				html: function(){
					
					data.title = 'Videos - ' + data.title;
					data.videos = videos;
					
					res.render('videos', data);
				}
			});
			
		});
	
};


module.exports = router;