var router = require('express').Router(),
	helpers = require('../config/helpers'),
	Subscription = require('../models/subscription');

router.all('*', helpers.isLoggedIn);

router.post('/watched', function(req, res, next) {
	
	if( ! req.body.video ) 
		next(new Error('video is not set'));
	
	Subscription
		.findOneAndUpdate({user:req.user._id}, {
			$addToSet: { watched: { $each: req.body.video.split(',') }}
		}, function(err, sub){
			
			res.json({
				status: !err,
				message: 'video watched saved!'
			});
		});
		
});
	
module.exports = router;