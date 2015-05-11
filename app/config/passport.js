var passport = require('passport'),
	User = require('../models/user'),
	refresh = require('passport-oauth2-refresh'),
	YoutubeStrategy = require('passport-youtube-v3').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

var youtube = new YoutubeStrategy({
	clientID: process.env.YOUTUBE_CLIENT_ID,
	clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
	callbackURL: '/auth/youtube/callback'
}, function(accessToken, refreshToken, profile, done) {
	console.log('profile', profile, accessToken);
		
	User.findOne({ 'youtube.id': profile.id }, function (err, user) {
		
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
			if (err)
				console.log(err);
			
			return done(err, user);
		});
	});
});

passport.use(youtube);
refresh.use(youtube);

module.exports = passport;