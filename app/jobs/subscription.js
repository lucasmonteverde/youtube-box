'use strict';

var _ = require('lodash'),
	API = require('libs/api'),
	UserControl = require('libs/user'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Subscription = mongoose.model('Subscription');
	
function subscriptions(user, nextPageToken) {
	
	if( ! user ) return;

	return API('subscriptions', {
		mine: true,
		part: 'snippet',
		fields: 'nextPageToken,items(snippet)',
		pageToken: nextPageToken
	}, subscriptions, user)
	.then(function(items) {
		
		if( items && items.length ) {
			
			var channelsId = _.map(items, 'snippet.resourceId.channelId');
			
			return Subscription.update({user: user._id}, nextPageToken ? {
				$addToSet: { channels: { $each: channelsId } }
			} : {
				channels: channelsId
			}, { upsert: true });
		}
		
		console.log('channels', items && items.length);
		
	})
	.catch(function(err) {
		console.error('Error:subscriptions', err);
	});
	
};

function run() {
	
	return User
		.find({status: true})
		.select('email youtube')
		.then(function(users) {
			return users;
		})
		.each(function(user){
			return UserControl.refreshAccessToken(user).then(subscriptions);
		})
		.catch(function(err) {
			console.error('Error:updateSubscriptions', err);
		});
};

module.exports = { run, subscriptions };