'use strict';

var request = require('request-promise');

module.exports = function(method, filter, callback, callbackArgs) {
	
	//console.time('request');
	
	filter.prettyPrint = false;
	filter.maxResults = 50;
	
	var params = {
		url: 'https://www.googleapis.com/youtube/v3/' + method,
		qs: filter,
		json: true,
		gzip: true
	};
	
	if ( filter.mine && callbackArgs.youtube ) {
		params.auth = {
			bearer: callbackArgs.youtube.accessToken
		};
	} else {
		filter.key = process.env.YOUTUBE_API_KEY;
	}
	
	return request(params).then(function(data){
		//console.timeEnd('request');
		
		var cbArgs = callbackArgs;
		
		if( data.nextPageToken && callback ) {
			//console.log('callback', method, filter);
			callback(cbArgs, data.nextPageToken);
		}
		
		callback = null;
		callbackArgs = null;
		
		return data.items;
	})
	.catch(function(e){
		console.error('request', e.error);
		
		return [];
	});
};