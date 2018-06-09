'use strict';

const redis = require('redis'),
	Cacheman = require('cacheman-redis');
	
const client = redis.createClient({
	url: process.env.REDIS_URL || process.env.REDISCLOUD_URL,
	no_ready_check: true
});

client.on('error', err => console.error(err) );
client.cache = new Cacheman(client);

module.exports = client;