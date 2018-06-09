'use strict';

const fs = require('fs'),
	mongoose = require('mongoose'),
	dbURI = process.env.MONGODB || process.env.MONGOHQ_URL || process.env.MONGODB_URI;

mongoose.Promise = require('bluebird');

mongoose.connect(dbURI, {
	config: {
		autoIndex: process.env.NO_INDEX ? false : true
	}
});

mongoose.set('debug', process.env.NODE_ENV === 'development');

mongoose.connection
	.on('connected', () => console.info('Mongoose default connection open to:', dbURI) )
	.on('error', err => console.error('Mongoose default connection error:', err) )
	.on('disconnected', () => console.info('Mongoose default connection disconnected') );

process.on('SIGINT', () => mongoose.connection.close( () => {
	console.log('Mongoose default connection disconnected through app termination');
	process.exit(0);
}) );	

fs.readdirSync('./app/models').forEach( model => require('models/' + model) );

module.exports = mongoose;