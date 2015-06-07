'use strict';

require('dotenv').load();

var db = require('./app/config/db'),
	passport = require('./app/config/passport'),
	Sync = require('./app/jobs/sync');
	
//name = process.argv.slice(2);
	
/*Sync.updateSubscriptions()
	.then( function(){
		console.log('sync user done');
	})
	.then( Sync.updateChannels )
	.then(function(){
		console.log('sync channels done');
	})
	.then( Sync.updateVideos )
	.then(function(){
		console.log('sync videos done');
	});
	*/
	
//Sync.updateSubscriptions();

Sync.updateChannels();

//Sync.updateVideos();


//process.exit(0);