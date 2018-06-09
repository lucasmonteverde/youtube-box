'use strict';

process.env.NODE_PATH = __dirname + '/app';
require('module').Module._initPaths();

if ( 'production' !== process.env.NODE_ENV ) {
	require('dotenv').config({ silent: true });
}

process.env.NO_INDEX = 1;

require('config/db'),
require('config/passport');

const Job = require('jobs/' + process.argv.slice(2) );

if ( Job ) {
	
	Job.run()
		.then( () => process.exit(0) )
		.catch( () => process.exit(1) );
	
}