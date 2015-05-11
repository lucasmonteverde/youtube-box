var redis = require('redis'),
	url = require('url');
	
var redisURL = url.parse(process.env.REDIS_URL || process.env.REDISCLOUD_URL);

var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(':')[1]);

module.exports = client;