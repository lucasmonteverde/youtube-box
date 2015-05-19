'use strict';

require('dotenv').load();

var db = require('./app/config/db'),
	passport = require('./app/config/passport'),
	User = require('./app/models/user'),
	Sync = require('./app/jobs/sync');
	
User.find().then(function(users){
	return users;
}).each(function(user){
	Sync.subscriptions(user);
});