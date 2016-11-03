'use strict';

var request = require('request-promise'),
	Promise = require('bluebird'),
	moment = require('moment'),
	refresh = require('passport-oauth2-refresh'),
	_ = require('lodash'),
	API = require('../libs/api'),
	User = require('../models/user'),
	Subscription = require('../models/subscription'),
	Channel = require('../models/channel'),
	Video = require('../models/video');
	
//require('request-debug')(request);
Promise.promisifyAll(refresh);

var refreshAccessToken = exports.refreshAccessToken = function(user){
	
	if( moment.utc().subtract(55, 'minutes').isBefore( user.youtube.accessTokenUpdate ) ) {
		return Promise.resolve(user);
	}
	
	if( ! user.youtube.refreshToken ) {
		
		user.status = false;
		
		user.save();
		
		return Promise.reject(new Error('refreshToken is not defined'));
	}
	
	return refresh
		.requestNewAccessTokenAsync('youtube', user.youtube.refreshToken)
		.then(function(accessToken){
			//console.log( 'accessToken', accessToken );
			
			user.youtube.accessToken = accessToken;
			user.youtube.accessTokenUpdate = new Date().toISOString();
			
			user.markModified('youtube');
			
			user.save();
			
			return user;
		})
		.catch(function(err) {
			console.error(err);
		});
};

var subscriptions = exports.subscriptions = function(user, nextPageToken){
	
	return API('subscriptions', {
		mine: true,
		part: 'snippet',
		fields: 'nextPageToken,items(snippet)',
		pageToken: nextPageToken
	}, subscriptions, user)
	.each(function(item){
		
		Channel.findByIdAndUpdate(item.snippet.resourceId.channelId, {
			title: item.snippet.title,
			description: item.snippet.description,
			thumbnail: item.snippet.thumbnails.default.url
		}, { upsert: true }).exec();
		
	})
	.then(function(items){
		
		if( items && items.length ) {
			
			var channelsId = _.map(items, 'snippet.resourceId.channelId');
			
			Subscription.update({user: user._id}, nextPageToken ? {
				$addToSet: { channels: { $each: channelsId } }
			} : {
				channels: channelsId
			}, { upsert: true }).exec();
		}
		
		user = null;
		
		console.log('channels', items && items.length);
		
	})
	.catch(function(err) {
		console.error(err);
	});
	
};

exports.updateSubscriptions = function(){
	
	return User
			.find({status: true})
			.select('youtube')
			.then(function(users){
				return users;
			})
			.each(function(user){
				
				return refreshAccessToken(user)
					.then(function(refreshUser){
						return subscriptions(refreshUser);
					});
					
			})
			.catch(function(err) {
				console.error(err);
			});
};

var videos = exports.videos = function(videoId, nextPageToken){
	
	return API('videos', {
		id: videoId,
		part: 'contentDetails,statistics',
		fields: 'nextPageToken,items(id,contentDetails,statistics)',
		pageToken: nextPageToken
	}, videos, videoId)
	.each(function(item){
		
		/* "contentDetails": {
			"duration": "PT1H41M23S",
			"dimension": "2d",
			"definition": "hd",
			"caption": "false",
			"licensedContent": true
		},
		"statistics": {
			"viewCount": "75196",
			"likeCount": "1837",
			"dislikeCount": "59",
			"favoriteCount": "0",
			"commentCount": "61"
		 } */
		 
		var result, data = {
			duration: 0,
			definition: item.contentDetails.definition
		};
		
		if( (result = /(?:(\d+)H)?(?:(\d+)M)?(\d+)S/.exec(item.contentDetails.duration) ) ) {
			data.duration = ((parseInt(result[1] || 0, 10) * 60) + parseInt(result[2] || 0, 10) ) * 60 + parseInt(result[3] || 0, 10);
		}
		
		if( item.statistics ) {
			data.views = item.statistics.viewCount || 0;
			data.likes = item.statistics.likeCount || 0;
			data.dislikes = item.statistics.dislikeCount || 0;
		}
		
		Video.findByIdAndUpdate(item.id, data, { upsert: true }, function(err){
			if (err) console.error( err );
		});
		
	})
	.catch(function(err) {
		console.error(err);
	});
};

var activities = exports.activities = function(channel, nextPageToken){
	
	return API('activities', {
		channelId: channel._id,
		part: 'snippet,contentDetails',
		fields: 'nextPageToken,items(snippet,contentDetails)',
		publishedAfter: channel.updatedDate || moment().subtract(1, 'month').valueOf(),
		pageToken: nextPageToken
	}, activities, channel)
	.filter(function(item){
		return item.snippet.type === 'upload';
	})
	.each(function(item){
		
		Video.findByIdAndUpdate(item.contentDetails.upload.videoId, {
			title: item.snippet.title,
			description: item.snippet.description,
			published: item.snippet.publishedAt,
			channel: item.snippet.channelId,
		}, { upsert: true }).exec();
		
	})
	.then(function(items){
		
		if( ! nextPageToken ) {
			channel.updatedDate = Date.now();
			channel.save();
		}
			
		if( items && items.length ) {
			console.log('activities', items[0].snippet.channelTitle, items.length);
			
			var videosId = _.map(items, 'contentDetails.upload.videoId'),
				documents = videosId.map(function(item) {
					return { _id: item };
				});

			Subscription.update({
				channels: channel._id
			}, {
				$addToSet: { videos: { $each: documents } }
			}, {multi: true}).exec();
			
			videos(videosId.join(','));
		}
		
		channel = null;
	})
	.catch(function(err) {
		console.error(err);
	});
};

exports.updateChannels = function(){
	
	return Channel
			.find()
			.select('updatedDate')
			.then(function(channels){
				return channels;
			})
			.each(function(channel){
				return activities(channel);
			})
			.catch(function(err) {
				console.error(err);
			});
};



exports.updateVideos = function(){
	
	return Video.find({
		published: {$gte: moment().subtract(1, 'month').valueOf() }
	})
	.select('_id')
	.lean()
	.then(function(videos){
		return _.chain(videos).map('_id').chunk(50).value();
	})
	.each(function(ids){
		videos(ids.join(','));
	})
	.catch(function(err) {
		console.error(err);
	});
};

exports.getUserEmail = function(user){
	request({
		url: 'https://www.googleapis.com/plus/v1/people/me',
		json: true,
		gzip: true,
		auth:{
			bearer: user.youtube.accessToken
		}
	})
	.then(function(result){
		
		if(result && result.emails){
			user.email = result.emails[0].value;
			
			user.save();
			
			user = null;
		}
	})
	.catch(function(e){
		console.error('request', e.error);
	});
};