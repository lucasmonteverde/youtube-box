var CronJob = require('cron').CronJob,
	User = require('../models/user'),
	Sync = require('../jobs/sync');
	
new CronJob('00 00 * * * *', function() {
	
	Sync.userSubscriptions()
		.then( Sync.channels )
		.then(function(){
			console.log('sync user done');
		});
	
}, null, true);