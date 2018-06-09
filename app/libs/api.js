'use strict';

const request = require('request-promise');

module.exports = function(method, filter, callback, callbackArgs) {
	
	//console.time('request');

	filter.prettyPrint = false;
	filter.maxResults = 50;
	
	let params = {
		url: 'https://www.googleapis.com/youtube/v3/' + method,
		qs: filter,
		json: true,
		gzip: true
	};

	if ( callbackArgs && callbackArgs.youtube && filter.mine ) {
		params.auth = {
			bearer: callbackArgs.youtube.accessToken
		};
	} else {
		//filter.mine = false;
		filter.key = process.env.YOUTUBE_API_KEY;
	}
	
	return request(params).then( data => {
		//console.timeEnd('request');
		
		let cbArgs = callbackArgs;
		
		if( data.nextPageToken && callback ) {
			//console.log('callback', method, filter);
			callback(cbArgs, data.nextPageToken);
		}
		
		callback = null;
		callbackArgs = null;
		
		return data.items;
	})
	.catch( e => {
		console.error('request', e.error, callbackArgs);
		
		return [];
	});
};