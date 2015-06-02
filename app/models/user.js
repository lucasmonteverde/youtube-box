var mongoose = require('mongoose'),
	Sync = require('../jobs/sync'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
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

UserSchema.index({ 'youtube.id': 1 }, {unique: true});

UserSchema.pre('save', function(done){
	
	if( ! this.sync ) {
		Sync.subscriptions(this);
		this.sync = true;
	}
	
	done();
});

module.exports = mongoose.model('User', UserSchema);