'use strict';

exports.formatHTML = function(text) {
	return text
		.replace(/(\r\n|\n|\r)/gm, '<br />')
		.replace(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim, '<a href="$&" target="_blank">$&</a>') // http://, https://, ftp://
		.replace(/(^|[^\/])(www\.[\S]+(\b|$))/gim, '$1<a href="http://$2" target="_blank">$2</a>'); // www. sans http:// or https://
};

exports.formatTime = function(text) {
	var totalSec = parseInt(text, 10);
	
	if( !totalSec ) return;
	
	var hours = parseInt( totalSec / 3600, 10 ) % 24,
		minutes = parseInt( totalSec / 60, 10 ) % 60,
		seconds = totalSec % 60;

	return (hours < 10 ? "0" + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds  < 10 ? '0' + seconds : seconds);
};

exports.active = function(active, path, strict){
	return (strict ? active === path : new RegExp(active).test(path)) ? 'active' : '';
};