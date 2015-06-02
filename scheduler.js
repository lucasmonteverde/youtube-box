'use strict';

require('dotenv').load();

var db = require('./app/config/db'),
	passport = require('./app/config/passport'),
	Sync = require('./app/jobs/sync');
	

/*Sync.userSubscriptions()
	.then( Sync.channels )
	.then(function(){
		console.log('sync user done');
		
		//process.exit(0);
	});*/

Sync.userSubscriptions();

//Sync.channels();