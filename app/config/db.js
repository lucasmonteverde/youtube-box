/* global process */

var mongoose = require('mongoose'),
	dbURI = process.env.MONGODB || process.env.MONGOHQ_URL;

mongoose.connect(dbURI);

mongoose.set('debug', process.env.ENV !== 'production');

mongoose.connection
	.on('connected', function () {
		console.info('Mongoose default connection open to:', dbURI);
	}).on('error',function (err) {
		console.error('Mongoose default connection error:', err);
	}).on('disconnected', function () {
		console.info('Mongoose default connection disconnected');
	});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});

module.exports = mongoose;