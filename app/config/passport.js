var passport = require('passport'),
	YoutubeStrategy = require('passport-youtube-v3').Strategy,
	//refresh = require('passport-oauth2-refresh'),
	request = require('request-promise'),
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
		//approval_prompt: 'auto'
	};
};

var youtube = new YoutubeStrategy({
	clientID: process.env.YOUTUBE_CLIENT_ID,
	clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
	callbackURL: '/auth/youtube/callback',
	scope: ['https://www.googleapis.com/auth/youtube.readonly', 'email'] //'https://www.googleapis.com/auth/userinfo.email'
}, function(accessToken, refreshToken, profile, done) {
	console.log('profile', profile);
	console.log('accessToken',accessToken);
		
	User
		.findOne({ 'youtube.id': profile.id })
		.then(function(user) {
			if (!user) {
				user = new User({
					name: profile.displayName,
					//email: profile.emails[0].value,
					youtube: {
						id: profile.id || profile._json.id
					}
				});
			}
			
			user.youtube.accessToken = accessToken;
			user.youtube.refreshToken = refreshToken;
				
			user.save(function (err) {
				if (err) console.error(err);
					
				if( ! user.email ) {
					getUserEmail(user);
				}
				
				return done(err, user);
			});
		})
		.catch(done);
});

var getUserEmail = function(user){
	request({
		url: 'https://www.googleapis.com/plus/v1/people/me',
		json: true,
		auth:{
			bearer: user.youtube.accessToken
		}
	}).then(function(result){
		
		if(result && result.emails){
			user.email = result.emails[0].value;
			
			user.save();
		}
	});
};

passport.use(youtube);
//refresh.use(youtube);

module.exports = passport;