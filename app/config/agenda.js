var db = require('./db'),
	jobs = db.connection.collection('jobs'),
	agenda = require('agenda')(),
	noop = function() {};

jobs.ensureIndex({
	nextRunAt: 1, 
	lockedAt: 1, 
	name: 1, 
	priority: 1
}, noop);

agenda
	.mongo(jobs)
	.defaultLockLifetime(10000);
	//.processEvery('1 minute');
	
/* agenda.define('setup', {lockLifetime:10000}, function(job, done) {
	console.log(job.attrs.name, job.attrs.lastFinishedAt);
	
	done(new Error('nope'));
}); */

/*agenda.define('delete old users', function(job, done) {
	User.find().then(function(users){
		return users;
	}).each(function(user){
		Sync.subscriptions(user.youtube.id);
	});
});*/

//agenda.define('process', require('../jobs/process'));

//agenda.define('submit', require('../jobs/submit'));

//agenda.every('10 seconds', 'setup');

//agenda.every('10 minute', 'process xml');

//agenda.every('1 minute', 'lead submit');

//agenda.start();

module.exports = agenda;