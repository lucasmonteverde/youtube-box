'use strict';

var CronJob = require('cron').CronJob,
	Sync = require('../jobs/sync');
	
new CronJob('00 */30 * * * *', function() {
	
	if( process.env.NODE_ENV === 'development' ) return;
	
	Sync.updateSubscriptions()
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
	
}, null, true);