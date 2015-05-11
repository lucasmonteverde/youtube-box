$(document).ready(function(){

	'use strict';

	var tabsHolder = $('.tabs'),
		tabs = tabsHolder.find('> ul li'),
		boxes = tabsHolder.find('.panel > div');

	// Tabs
	tabs.find('a').click(function(e){
		e.preventDefault();
		var self = $(this);
		tabs.removeClass('active').filter( self.parent() ).addClass('active');
		boxes.removeClass('active').filter( self.attr('href') ).addClass('active');
		return false;
	});
	
});