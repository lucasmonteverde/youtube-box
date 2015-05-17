var router = require('express').Router(),
	moment = require('moment'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');

router.get('/', function(req, res) {
	
	var data = {
		title: 'Youtube Box',
		message: req.session.messages
	};
	
	if( req.isAuthenticated() ){
		
		videos(req, res, data);
	
	}else{
		res.render('login', data);
	}
	
});

var videos = function(req, res, data) {

	data.sort = req.query.sort || req.cookies.sort;
	
	//TODO: Cookie options management
	if( req.query.sort ){
		res.cookie('sort', data.sort, { maxAge: 2592000000, httpOnly: true });
	}
	
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
					
			if( req.query.search ){
				query.where('title', new RegExp(req.query.search,'i'));
				data.search = req.query.search;
			}
			
			query.sort(data.sort ? data.sort : '-published');
			
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