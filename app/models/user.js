'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var schema = new Schema({
	name: { 
		type: String, 
		trim: true, 
		required: true
	},
	email: {
		type: String,
		trim: true,
		lowercase: true
	},
	status: {
		type: Boolean,
		default: true
	},
	lastLogin: Date,
	avatar: String,
	admin: Boolean,
	sync: Boolean,
	youtube: Schema.Types.Mixed
}, {collection: 'youtube-users'});

schema.index({ 'youtube.id': 1 }, {unique: true});

schema.pre('save', function(done) {

	if( ! this.sync ) {
		require('jobs/subscription').subscriptions(this);
		this.sync = true;
	}
	
	done();
});

module.exports = mongoose.model('User', schema);