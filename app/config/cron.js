var CronJob = require('cron').CronJob,
	User = require('../models/user'),
	Sync = require('../jobs/sync');
	
new CronJob('00 00 * * * *', function() {
	
	User.find().then(function(users){
		return users;
	}).each(function(user){
		Sync.subscriptions(user);
	});
	
}, null, true);