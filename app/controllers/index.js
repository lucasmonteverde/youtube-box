var router = require('express').Router(),
	moment = require('moment'),
	_ = require('lodash'),
	Subscription = require('../models/subscription'),
	Video = require('../models/video');

router.get('/', function(req, res) {
	
	var data = {
		title: 'Youtube Box',
		message: req.session.messages
	};
	
	/*req.app.on('sync', function(user, length){
		console.log(user , length);
	});*/
	
	if( req.isAuthenticated() ){
		
		videos(req, res, data);
		//data.videos = [];
		
		//res.render('videos', data);
	
	}else{
		data.layout = 'landing';
		
		res.render('index', data);
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
		.populate({
			path: 'channels', 
			select: '-description', 
			options : {sort: 'title'} 
		})
		.then(function(subscription){
			
			if(!subscription)
				return [];
				
			data.channels = subscription.channels;
				
			var query = Video.find({
						_id: {$nin: subscription.watched},
						published: {$gte: moment.utc().subtract(2,'month').toDate()}
					});
					
			if( req.query.search ){
				query.where('title', new RegExp(req.query.search,'i'));
				data.search = req.query.search;
			}
			
			if( req.query.channel ){
				query.where('channel', req.query.channel);
				data.channel = req.query.channel;
			}else{
				query.where('channel', {$in: subscription.channels});
			}
			
			query.sort(data.sort ? data.sort : '-published');
			
			return query;
		})
		.each(function(video){
			video.channel = _.find(data.channels, { '_id': video.channel });
		})
		.then(function(videos){
			
			//req.app.emit('sync', 'query done');
			
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