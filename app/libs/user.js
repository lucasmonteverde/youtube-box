'use strict';

var request = require('request-promise'),
	Promise = require('bluebird'),
	moment = require('moment'),
	refresh = require('passport-oauth2-refresh');

Promise.promisifyAll(refresh);

function refreshAccessToken(user) {
	
	if( moment.utc().subtract(55, 'minutes').isBefore( user.youtube.accessTokenUpdate ) ) {
		return Promise.resolve(user);
	}
	
	return refresh
		.requestNewAccessTokenAsync('youtube', user.youtube.refreshToken)
		.then(function(accessToken) {
			console.log('accessToken', accessToken);
			
			user.youtube.accessToken = accessToken;
			user.youtube.accessTokenUpdate = new Date().toISOString();
			
			user.markModified('youtube');
			
			return user.save();
		})
		.catch(function(err) {
			console.error('Refresh Error', err, user);

			if( err.statusCode === 400 ) { //Token has been expired or revoked.
				user.status = false;
				user.save();
			}
		});
}

function getUserEmail(user) {
	request({
		url: 'https://www.googleapis.com/plus/v1/people/me',
		json: true,
		auth: {
			bearer: user.youtube.accessToken
		}
	})
	.then(function(result) {
		
		if( result && result.emails ) {
			user.email = result.emails[0].value;
			
			return user.save();
		}
	})
	.catch(function(e){
		console.error('Error:getUserEmail', e.error);
	});
}

module.exports = { getUserEmail, refreshAccessToken };