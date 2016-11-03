'use strict';

var router = require('express').Router(),
	helpers = require('../config/helpers'),
	Sync = require('../jobs/sync'),
	Cleanup = require('../jobs/cleanup');
	
router.all('*', helpers.isLoggedIn);

router.get('/subscriptions', function(req, res) {
	
	Sync.subscriptions(req.user);
	
	res.send('subscriptions done');
});

router.get('/channels', function(req, res) {
	
	Sync.updateChannels();
	
	res.send('channels done');
});

router.get('/cleanup/channels', function(req, res) {
	
	Cleanup.removeChannels().then(function( data ){
		res.json(data);
	});
	
});

router.get('/cleanup/videos', function(req, res) {
	
	Cleanup.unwatchVideos(req.user);
	
	res.send('channels old done');
});

router.get('/cleanup/subscription', function(req, res) {
	
	Cleanup.subscriptionVideosUpgrade(req.user);
	
	res.send('subscription upgrade done');
});

router.get('/cleanup/user', function(req, res) {
	
	Cleanup.deleteUser([
		'566e571947220e0300ff9004',
		'555a335a7152c403004ec391',
		'56132c1421d5d303008baca0',
		'55f87d264a1de103005fb4cc',
		'566e579247220e0300ff9005',
		'56211aee6da45303006b3661',
		'55aa0dd7d2837b030063e3dd'
	]);
	
	res.send('user clenaup done');
});

module.exports = router;