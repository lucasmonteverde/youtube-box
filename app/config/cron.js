var CronJob = require('cron').CronJob,
	User = require('../models/user'),
	Sync = require('../jobs/sync');
	
new CronJob('00 00 * * * *', function() {
	
	User.find().then(function(user){
		
		if( user ) {
			Sync.subscriptions(user.youtube.id);
		}
	});
}, null, true);