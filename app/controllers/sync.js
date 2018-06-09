'use strict';

const router = require('express').Router(),
	helpers = require('config/helpers'),
	Subscriptions = require('jobs/subscription').subscriptions,
	Channels = require('jobs/channel').channels,
	Cleanup = require('jobs/cleanup');
	
router.all('*', helpers.isLoggedIn);

router.get('/subscriptions', (req, res) => {
	Subscriptions(req.user);
	
	res.send('subscriptions done');
});

router.get('/channels', (req, res) => {
	
	Channels();
	
	res.send('channels done');
});

router.get('/cleanup/channels', (req, res) => {
	
	Cleanup.removeChannels().then(data => res.json(data) );
	
});

router.get('/cleanup/videos', (req, res) => {
	
	Cleanup.removeOldVideos().then( () => res.send('videos upgrade done') );
});

router.get('/cleanup/subscription', (req, res) => {
	
	Cleanup.subscriptionVideosUpgrade();
	
	res.send('subscription upgrade done');
});

module.exports = router;