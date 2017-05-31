'use strict';

process.env.NODE_PATH = __dirname + '/app';
require('module').Module._initPaths();

if ( 'production' !== process.env.NODE_ENV ) {
	require('dotenv').config( { silent: true } );
}

require('config/db'),
require('config/passport');

var Sync = require('jobs/sync');
	
Sync.updateSubscriptions();

//Sync.updateChannels();

//Sync.updateVideos();