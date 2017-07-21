'use strict';

var _ = require('lodash'),
	moment = require('moment'),
	API = require('libs/api'),
	Video = require('mongoose').model('Video');
	
function videos(videoId, nextPageToken) {
	
	return API('videos', {
		id: videoId,
		part: 'snippet,contentDetails,statistics',
		fields: 'nextPageToken,items(id,snippet,contentDetails,statistics)',
		pageToken: nextPageToken
	}, videos, videoId)
	.each(function(item) {
		
		var data = {
			title: item.snippet.title,
			description: item.snippet.description,
			published: item.snippet.publishedAt,
			channel: item.snippet.channelId,
			definition: item.contentDetails.definition,
			duration: 0
		}, duration;
		
		if( (duration = /(?:(\d+)H)?(?:(\d+)M)?(\d+)S/.exec(item.contentDetails.duration) ) ) {
			data.duration = ((parseInt(duration[1] || 0, 10) * 60) + parseInt(duration[2] || 0, 10) ) * 60 + parseInt(duration[3] || 0, 10);
		}
		
		if( item.statistics ) {
			data.views = item.statistics.viewCount || 0;
			data.likes = item.statistics.likeCount || 0;
			data.dislikes = item.statistics.dislikeCount || 0;
		}
		
		return Video.findByIdAndUpdate(item.id, data, { upsert: true });
	})
	.catch(function(err) {
		console.error('Error:videos', err);
	});
}

function run() {
	
	return Video.find({
		published: { $gte: moment().subtract(1, 'month').valueOf() }
	})
	.select('_id')
	.lean()
	.then(function(videos){
		return _(videos).map('_id').chunk(50).value();
	})
	.each(function(ids){
		return videos(ids.join(','));
	})
	.catch(function(err) {
		console.error('Error:updateVideos', err);
	});
}

module.exports = { run, videos };