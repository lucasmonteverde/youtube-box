var passport = require('passport'),
	YoutubeStrategy = require('passport-youtube-v3').Strategy,
	refresh = require('passport-oauth2-refresh'),
	request = require('request-promise'),
	Sync = require('../jobs/sync'),
	User = require('../models/user');
	
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

YoutubeStrategy.prototype.authorizationParams = function(options) {
	return {
		access_type : 'offline'
		//approval_prompt: 'force'
	};
};

var youtube = new YoutubeStrategy({
	clientID: process.env.YOUTUBE_CLIENT_ID,
	clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
	callbackURL: '/auth/youtube/callback',
	scope: [
		'https://www.googleapis.com/auth/youtube.readonly',
		'https://www.googleapis.com/auth/userinfo.email'
	] //'email'
}, function(accessToken, refreshToken, profile, done) {
	console.log('profile', profile);
	//console.log('accessToken', accessToken);
	//console.log('refreshToken', refreshToken);
		
	User
		.findOne({ 'youtube.id': profile.id })
		.then(function(user) {
			
			if (!user) {
				user = new User({
					name: profile.displayName || 'user',
					youtube: {
						id: profile.id || profile._json.id
					}
				});
			}
			
			user.youtube.accessToken = accessToken;
			user.youtube.accessTokenUpdate = new Date();
			
			if( refreshToken ) {
				user.youtube.refreshToken = refreshToken;
			}
			
			user.markModified('youtube');
				
			user.save(function (err) {
				if (err) console.error(err);
					
				if( ! user.email ) {
					Sync.getUserEmail(user);
				}
				
				return done(err, user);
			});
		})
		.catch(done);
});

passport.use(youtube);
refresh.use(youtube);

module.exports = passport;