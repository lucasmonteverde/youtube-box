var router = require('express').Router(),
	Promise = require('bluebird'),
	User = require('../models/user'),
	Video = require('../models/video');

function isLoggedIn(req, res, next) {
	return req.isAuthenticated() ? next() : res.redirect('/');
}

router.get('/', function(req, res) {
	
	var data = { 
		title: 'Youtube Box',
		user: req.user,
		message: req.session.messages
	};
	
	if( req.isAuthenticated() ){
		
		videos(req, res);
	
	}else{
		res.render('login', data);
	}
	
});


var videos = function(req, res) {

	/* User
		.findById(req.user._id)
		.populate('channels')
		.populate('channels.videos')
		.exec(function(err, user){
			if (err) console.error( err );
			
			res.json(user);
		
		}); */
		
	User.findById(req.user._id).then(function(user){
		return Video.find({channel: {$in: user.channels}})
					.sort({published: -1})
					.populate('channel')
					.exec();
	}).then(function(videos){
		
		res.format({
			json: function(){
				res.json(videos);
			},
			html: function(){
				res.render('videos', {
					title: 'Videos',
					videos: videos
				});
			}
		});
		
	});
	
};

module.exports = router;