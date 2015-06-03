var moment = require('moment');

exports.isLoggedIn = function(req, res, next) {
	return req.isAuthenticated() ? next() : res.redirect('/');
};

exports.isAdmin = function(req, res, next) {
	return req.isAuthenticated() && req.user.admin ? next() : res.redirect('/');
};

exports.formatHTML = function(text) {
	return text && text
		.replace(/(\r\n|\n|\r)/gm, '<br />')
		.replace(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim, '<a href="$&" target="_blank">$&</a>') // http://, https://, ftp://
		.replace(/(^|[^\/])(www\.[\S]+(\b|$))/gim, '$1<a href="http://$2" target="_blank">$2</a>'); // www. sans http:// or https://
};

exports.excerpt = function(text) {
	var limit = 100;
	
	if( text && text.length > limit) {
		text = text.substring(0,limit) + '...';
	}
	
	return text;
};

exports.formatDate = function(date) {
	return moment(date).fromNow();
};

exports.formatTime = function(text) {
	return moment.utc(moment.duration(text, 'seconds').asMilliseconds()).format("HH:mm:ss").replace(/00:/,'');
	//return moment.duration(text, 'seconds').format('h:mm:ss');
};

exports.formatRating = function(likes, dislikes) {
	return Math.round((likes / (likes + dislikes)) * 100);
};

exports.formatRatingValue = function(likes, dislikes) {
	var rating = likes / (likes + dislikes),
		value = 'info';
	
	if(rating >= 0.75) {
		value = 'success';
	}else if( rating <= 0.25 ) {
		value = 'danger';
	}
	
	return value;
};

exports.formatLargeNumber = function(num, digits) {
	
	var units = ['k', 'M', 'B'],
		decimal;

	for(var i = units.length - 1; i >= 0; i--) {
		decimal = Math.pow(1000, i + 1);

		if(num <= -decimal || num >= decimal) {
			return +(num / decimal).toFixed(digits) + units[i];
		}
	}

	return num;
};

exports.youtubeVideo = function(id){
	return 'https://www.youtube.com/watch?v=' + id;
};

exports.selected = function(value, elem) {
	return value === elem ? 'selected' : '';
};

exports.active = function(active, path, strict){
	return (strict ? active === path : new RegExp(active).test(path)) ? 'active' : '';
};