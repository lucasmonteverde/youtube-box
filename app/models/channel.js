var mongoose	= require('mongoose'),
	Schema		= mongoose.Schema;

var ChannelSchema = new Schema({
	_id: String,
	title: String,
	description: String,
	thumbnail: String,
	updatedDate: Date,
	/* videos: [{
		type: String,
		ref: 'Video'
	}] */
}, {collection: 'youtube-channels', _id: false, versionKey: false});

module.exports = mongoose.model('Channel', ChannelSchema);