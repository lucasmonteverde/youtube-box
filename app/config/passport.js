'use strict';

var passport = require('passport'),
	YoutubeStrategy = require('passport-youtube-v3').Strategy,
	refresh = require('passport-oauth2-refresh'),
	UserControl = require('libs/user'),
	User = require('models/user');
	
var adminUsers = ['UCugDN9_9V-RKDB_ilYYE4RA'];
	
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

/*YoutubeStrategy.prototype.authorizationParams = function(options) {
	return {
		access_type : 'offline'
		//approval_prompt: 'force'
	};
};*/

var youtube = new YoutubeStrategy({
	clientID: process.env.YOUTUBE_CLIENT_ID,
	clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
	callbackURL: '/auth/youtube/callback',
	scope: [
		'https://www.googleapis.com/auth/youtube.readonly',
		'email'
		//'https://www.googleapis.com/auth/userinfo.email',
	]
}, function(accessToken, refreshToken, profile, done) {
	console.log('profile', profile);
	
	if( refreshToken ) {
		console.info( 'refreshToken', refreshToken );
	}
	//console.log('accessToken', accessToken);
	//console.log('refreshToken', refreshToken);
	User
		.findOne({ 'youtube.id': profile.id })
		.then(function(user) {
			
			user = user || new User({
				name: profile.displayName || 'user',
				youtube: {
					id: profile.id || profile._json.id
				}
			});
			
			try{
				user.avatar = profile._json && profile._json.items[0].snippet.thumbnails.medium.url;
			}catch(err){
				console.error('thumbnail not found');
			}
			
			if( adminUsers.indexOf(user.youtube.id) > -1 ) {
				user.admin = true;
			}
			
			user.youtube.accessToken = accessToken;
			user.youtube.accessTokenUpdate = new Date().toISOString();
			
			if( refreshToken ) {
				user.youtube.refreshToken = refreshToken;
			}
			
			user.lastLogin = Date.now();
			
			user.markModified('youtube');
				
			user.save(function (err) {
				if (err) console.error(err);
					
				if( ! user.email ) {
					UserControl.getUserEmail(user);
				}
				
				return done(err, user);
			});
		})
		.catch(done);
});

passport.use(youtube);
refresh.use(youtube);

module.exports = passport;