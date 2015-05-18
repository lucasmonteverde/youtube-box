var request = require('request-promise'),
	User = require('../models/user'),
	Subscription = require('../models/subscription'),
	Channel = require('../models/channel'),
	Video = require('../models/video');
	
//require('request-debug')(request);

var subscriptions = exports.subscriptions = function(user, nextPageToken){
	
	api('subscriptions', {
		mine: true,
		//channelId: channelId,
		part: 'snippet',
		fields: 'nextPageToken,items(snippet)',
		pageToken: nextPageToken
	}, subscriptions, user)
	.each(function(item){
		
		//console.log('each', item);
		
		Channel.findByIdAndUpdate(item.snippet.resourceId.channelId, {
			title: item.snippet.title,
			description: item.snippet.description,
			thumbnail: item.snippet.thumbnails.default.url
		}, { upsert: true }, function(err, channel){
			if (err) console.error( err );
		});
		
		activities(item.snippet.resourceId.channelId);
		
	})
	.then(function(items){
		
		if( items && items.length ){
			var channelsId = items.map(function(item){
				return item.snippet.resourceId.channelId;
			});
			
			Subscription.findOneAndUpdate({'user': user._id}, nextPageToken ? {
				$addToSet: { channels: { $each: channelsId } }
			} : {
				channels: channelsId
			}, { upsert: true }, function(err){
				if(err) console.error( err );
			});
		}
		
		console.log('items', items && items.length);
		
	});
};

var activities = exports.activities = function(channelId, nextPageToken){
	
	var dateFilter = new Date();
	dateFilter.setMonth ( dateFilter.getMonth() - 1 );
	
	api('activities', {
		channelId: channelId,
		part: 'snippet,contentDetails',
		fields: 'nextPageToken,items(snippet,contentDetails)',
		publishedAfter: dateFilter,
		pageToken: nextPageToken
	}, activities, channelId)
	.filter(function(item){
		return item.snippet.type === 'upload';
	})
	.each(function(item){
		
		Video.findByIdAndUpdate(item.contentDetails.upload.videoId, {
			title: item.snippet.title,
			description: item.snippet.description,
			published: item.snippet.publishedAt,
			channel: item.snippet.channelId,
		}, { upsert: true }, function(err, video){
			if (err) console.error( err );
		});
		
	})
	.then(function(items){
		
		if( items && items.length ){
			console.log('items', items[0].snippet.channelTitle, items.length);
			
			videos(items.map(function(item){
				return item.contentDetails.upload.videoId;
			}).join(','));
		}
	});
};

var videos = exports.videos = function(videoId, nextPageToken){
	
	var durationExp = /(?:(\d+)H)?(?:(\d+)M)?(\d+)S/;
	
	api('videos', {
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
		 
		var result, duration = 0;
		
		if( (result = durationExp.exec(item.contentDetails.duration) ) ) {
			duration = ((parseInt(result[1] || 0,10) * 60) + parseInt(result[2] || 0,10) ) * 60 + parseInt(result[3] || 0,10);
		}
		
		Video.findByIdAndUpdate(item.id, {
			duration: duration,
			views: item.statistics.viewCount,
			likes: item.statistics.likeCount,
			dislikes: item.statistics.dislikeCount,
			definition: item.contentDetails.definition
		}, { upsert: true }, function(err, video){
			if (err) console.error( err );
		});
		
	});
	/* .then(function(items){
		
		console.log('items', items && items.length);
		
	}); */
};

var api = function(method, filter, callback, callbackArgs){
	
	//console.time('request');
	
	filter.prettyPrint = false;
	filter.maxResults = 50;
	
	var params = {
		url: 'https://www.googleapis.com/youtube/v3/' + method,
		qs: filter,
		json: true,
		gzip: true
	};
	
	if ( filter.mine && callbackArgs.youtube ){
		params.auth = {
			bearer: callbackArgs.youtube.accessToken
		};
	}else{
		filter.key = process.env.YOUTUBE_API_KEY;
	}
	
	return request(params).then(function(data){
		//console.timeEnd('request');
		
		//console.log('data', data);
		
		if( data.nextPageToken && callback ) {
			//console.log('callback', method, filter);
			callback(callbackArgs, data.nextPageToken);
		}
		
		return data.items;
	})
	.catch(function(e){
		console.error('request', e.error);
		
		return [];
	});
};