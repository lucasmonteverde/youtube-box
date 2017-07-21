'use strict';

var _ = require('lodash'),
	moment = require('moment'),
	API = require('libs/api'),
	videos = require('jobs/video').videos,
	mongoose = require('mongoose'),
	Subscription = mongoose.model('Subscription'),
	Channel = mongoose.model('Channel');

function activities(channel, nextPageToken) {
	
	return API('activities', {
		channelId: channel._id,
		part: 'snippet,contentDetails',
		fields: 'nextPageToken,items(snippet,contentDetails)',
		publishedAfter: channel.updatedDate || moment().subtract(1, 'month').toISOString(),
		pageToken: nextPageToken
	}, activities, channel)
	.filter(function(item) {
		return item.snippet.type === 'upload';
	})
	.then(function(items) {
		
		if( ! nextPageToken ) {
			channel.updatedDate = Date.now();
			channel.save();
		}
			
		if( items && items.length ) {
			console.log('activities', items[0].snippet.channelTitle, items.length);
			
			var videosId = _.map(items, 'contentDetails.upload.videoId');
			
			var documents = videosId.map(function(item) {
				return { _id: item };
			});

			Subscription.update({
				channels: channel._id
			}, {
				$addToSet: { videos: { $each: documents } }
			}, {multi: true});

			return videos(videosId.join(','));
		}

	})
	.catch(function(err) {
		console.error('Error:activities', err);
	});
};

function run() {
	
	return Channel
		.find()
		.select('updatedDate')
		.then(function(channels) {
			return channels;
		})
		.each(function(channel) {
			return activities(channel);
		})
		.catch(function(err) {
			console.error('Error:updateChannels', err);
		});
};

module.exports = { run };