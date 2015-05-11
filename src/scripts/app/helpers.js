// Avoid `console` errors in browsers that lack a console.
(function() {
	var method;
	var noop = function noop() {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

String.prototype.formatArray = function(a){
	return this.replace(/\{(\d+)\}/g, function(r,e){return a[e];});
};
String.prototype.render = function(obj){
	return this.replace(/\{(\w+)\}/g, function(r,e){return obj[e];});
};
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};
/* String.prototype.humanize = function( splitAt ) {
	return (splitAt ? this.slice(0, splitAt) + ' ' + this.slice(splitAt) : this).replace(/_|-/g, ' ').replace(/(\w+)/g, function(match) {
		return match.charAt(0).toUpperCase() + match.slice(1);
	});
}; */

//jQuery extensions
(function ($) {
	$.fn.getClassName = function(append){
		var cl = $(this).attr('class');
		return cl && (append + '.' + cl.replace(' ','.'));
	};
	
	$.fn.validEmail = function() {
		return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( $(this).val());
	};
	
	$.fn.getParentKey = function( keys, values, value ){
		var self = this;
			
		$.each(keys, function( i, item ){
			if( self.closest( item ).length > 0 ) {
				value = values[i];
				return;
			}
		});
		
		return value;
	};
	
	$.extend($.expr[":"], {
		// http://jqueryvalidation.org/blank-selector/
		blank: function( a ) { return !$.trim("" + $(a).val()); },
		// http://jqueryvalidation.org/filled-selector/
		filled: function( a ) { return !!$.trim("" + $(a).val()); },
		// http://jqueryvalidation.org/unchecked-selector/
		unchecked: function( a ) { return !$(a).prop("checked"); }
	});
	
	/*$.expr[":"].Contains = $.expr.createPseudo(function(arg) {
		return function( elem ) {
			return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
		};
	});*/
	
	/* $.fn.formatSimilar = function( $elem ){
		return $(this).text( $elem.text().split(' - ')[1] ); //;stringDiff( title, $(this).text() );
	}; */
	
	/* $.fn.humanize = function( splitAt ){
		return $(this).text( $(this).text().humanize(splitAt) );
	};*/
	
}(jQuery));