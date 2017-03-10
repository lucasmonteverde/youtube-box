'use strict';

process.env.NODE_PATH = __dirname + '/app';
require('module').Module._initPaths();

if ( 'production' !== process.env.NODE_ENV ) {
	require('dotenv').config( { silent: true } );
}

require('./app/config/db'),
require('./app/config/passport');

var Sync = require('./app/jobs/sync');
	
Sync.updateSubscriptions();

//Sync.updateChannels();

//Sync.updateVideos();