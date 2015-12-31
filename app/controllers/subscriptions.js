var router = require('express').Router(),
	_ = require('lodash'),
	helpers = require('../config/helpers'),
	Subscription = require('../models/subscription');

router.all('*', helpers.isLoggedIn);

router.post('/watched', function(req, res, next) {
	
	if( ! req.body.video ) 
		return next(new Error('video is not set'));
		
	var videosId = req.body.video.split(',');
	
	/*Subscription
		.findOneAndUpdate({user:req.user._id}, {
			$addToSet: { watched: { video : videosId, date: Date.now() } },
			$pullAll: { unwatched: videosId }
		},*/
	
	Subscription
		.findOne({user:req.user._id})
		.select('watched unwatched')
		.then(function(sub){
			
			if( sub ) {
				videosId.forEach(function(video){
					sub.watched.push({ 
						video : video,
						date: Date.now()
					});
					
					sub.unwatched.pull(video);
				});
				
				sub.watched = _.uniq(sub.watched, 'video');
				
				sub.save(function(err){
					if( err ) console.error(err);
					
					res.json({
						status: !err,
						message: err ? err : 'video watched saved!'
					});
				});
			}
			
		})
		.catch(function(e) {
			return next(e);
		});
		
});
	
module.exports = router;