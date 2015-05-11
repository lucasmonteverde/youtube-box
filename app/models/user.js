var mongoose	= require('mongoose'),
	Schema		= mongoose.Schema;

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
	channels: [{
		type: String,
		ref: 'Channel'
	}],
	youtube: Schema.Types.Mixed
}, {collection: 'youtube-users'});

UserSchema.index({ 'youtube.id': 1 }, {unique: true});

module.exports = mongoose.model('User', UserSchema);