'use strict';

require('dotenv').load();

var db = require('./app/config/db'),
	passport = require('./app/config/passport'),
	Sync = require('./app/jobs/sync');
	
Sync.userSubscriptions()
	.then( function(){
		console.log('sync user done');	
	})
	.then( Sync.channels )
	.then(function(){
		console.log('sync channels done');
	});

//Sync.userSubscriptions();

//Sync.channels();

//process.exit(0);