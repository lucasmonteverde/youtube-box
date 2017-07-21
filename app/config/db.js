'use strict';

var fs = require('fs'),
	mongoose = require('mongoose'),
	dbURI = process.env.MONGODB || process.env.MONGOHQ_URL || process.env.MONGODB_URI;

mongoose.Promise = require('bluebird');

mongoose.connect(dbURI, {
	useMongoClient: true,
	config: {
		autoIndex: process.env.NO_INDEX ? false : true
	}
});

mongoose.set('debug', process.env.NODE_ENV === 'development');

mongoose.connection
	.on('connected', function () {
		console.info('Mongoose default connection open to:', dbURI);
	})
	.on('error',function (err) {
		console.error('Mongoose default connection error:', err);
	})
	.on('disconnected', function () {
		console.info('Mongoose default connection disconnected');
	});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});

fs.readdirSync('./app/models').forEach( model => require('models/' + model) );

module.exports = mongoose;