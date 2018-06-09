'use strict';

const _ = require('lodash'),
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
	.filter( item => item.snippet.type === 'upload')
	.then( items => {
		
		if ( ! nextPageToken ) {
			channel.updatedDate = Date.now();
			channel.save();
		}
			
		if ( items && items.length ) {
			console.log('activities', items[0].snippet.channelTitle, items.length);
			
			const videosId = _.map(items, 'contentDetails.upload.videoId');
			
			const documents = videosId.map(item => { _id: item });

			Subscription.updateMany({
				channels: channel._id
			}, {
				$push: { videos: documents }
			});

			return videos(videosId.join(','));
		}

	})
	.catch( err => console.error('Error:activities', err) );
}

function run() {
	
	return Channel
		.find()
		.select('updatedDate')
		.then( channels => channels )
		.each( channel => activities(channel) )
		.catch( err => console.error('Error:updateChannels', err) );
}

module.exports = { run };