var CronJob = require('cron').CronJob,
	Sync = require('../jobs/sync');
	
new CronJob('00 00 * * * *', function() {
	
	Sync.userSubscriptions()
		.then( function(){
			console.log('sync user done');	
		})
		.then( Sync.channels )
		.then(function(){
			console.log('sync channels done');
		});
	
}, null, true);