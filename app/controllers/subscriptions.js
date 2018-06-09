'use strict';

const router = require('express').Router(),
	helpers = require('config/helpers'),
	Subscription = require('models/subscription');

router.all('*', helpers.isLoggedIn);

router.get('/', (req, res, next) => {
	
	Subscription
		.findOne({user:req.user._id})
		.select('channels videos')
		.lean()
		.then( subscriptions => res.json( subscriptions ) )
		.catch( e => next(e) );
});

router.get('/all', (req, res, next) => {
	
	Subscription
		.find()
		.select('user')
		.sort('lastLogin')
		.populate('user')
		.lean()
		.then( subscriptions =>res.json( subscriptions ) )
		.catch( e => next(e) );
});

router.post('/watched', (req, res, next) => {
	
	if( ! req.body.video ) {
		return next(new Error('video is not set'));
	}
		
	const videosId = req.body.video.split(',');
	
	console.log( videosId );

	Subscription
		.updateMany( {
			'user': req.user._id,
			'videos._id': { $in: videosId }
		}, { $set: {
			'videos.$[].watched': Date.now()
		}})
		.then(() => res.json({
			status: true,
			message: 'video watched saved!'
		}))
		.catch(e => next(e) );
		
});
	
module.exports = router;