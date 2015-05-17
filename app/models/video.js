var mongoose	= require('mongoose'),
	Schema		= mongoose.Schema;

var VideoSchema = new Schema({
	_id: String,
	title: String,
	description: String,
	published: Date,
	duration: Number,
	views: Number,
	likes: Number,
	dislikes: Number,
	definition: String,
	channel: {
		type: String,
		ref: 'Channel'
	}
}, {collection: 'youtube-videos', _id: false, versionKey: false});

module.exports = mongoose.model('Video', VideoSchema);