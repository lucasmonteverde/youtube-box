/* global $:true, Cookies:true, Uri:true */

$(document).ready(function(){

	'use strict';
	
	$('.btn-login').click(function(e){
		e.preventDefault();
		
		var width = 450,
			height = 600;
			
		var sLeft = window.screenLeft || screen.left || 0;
		var sTop = window.screenTop || screen.top || 0;
		
		var sWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
	    var sHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;
	
		var left = ((sWidth / 2) - (width / 2)) + sLeft;
		var top = ((sHeight / 2) - (height / 2)) + sTop;
		
		var win = window.open(this.href, 'popUpWindow', 'centerscreen=true,resizable,scrollbars,status,width=' + width +',height=' + height + ',top=' + top + ',left=' + left);
		win.onbeforeunload = function(){
			location.reload();
		};
		
		var intervalID = setInterval(function(){
			if (win.closed) {
	
				console.log('window closed');
				
				location.reload();
	
				clearInterval(intervalID);
			}
		}, 100);
		
	});
	
	var $videos = $('.videos');
	
	$('.watched').click(function(e){
		var $video = $(this).closest('.video');
		
		API.watched($video.data('id'), $video).done(function(){
			$videos.text( parseInt($videos.text(), 10) - 1 );
		});
	});
	
	$('.watched-all').click(function(e){
		e.preventDefault();
		
		var $video = $('.video');
		
		var videoId = $video.map(function(){
			return $(this).data('id');
		}).get().join(',');
		
		API.watched(videoId, $video).done(function(){
			$videos.text( parseInt($videos.text(), 10) - $video.length );
		});
	});
	
	$('.filter select').change(function(){
		var self = $(this);
			//value = self.val() || 'new';
			
		self.closest('form').submit();
		
		//location.href = new Uri(location.href).replaceQueryParam('sort', value).toString();
	});
	
	$('.filter').submit(function(){
		
		//$('input,select[name,value=""]').attr('name', '');
		$(this).find('input, select').each(function(){
			var self = $(this);
			if( self.val() === ''){
				self.removeAttr('name');
			}
		});
		
	});
	
	/*var defaultThumb = 'mqdefault.';
	
	$('.thumb img').hover(function(){
		var self = $(this);
		
		var i = setInterval(function(){
			
			var counter = self.data('thumb') || 0;
			counter = counter + 1 > 3 ? 1 : counter + 1;
			
			self.attr('src', self.attr('src').replace(self.data('thumb') ? /\d\./ : defaultThumb, counter + '.') );
			
			self.data('thumb', counter);
			
		}, 1000);
		
		self.data('interval', i);
		
	}, function(){
		var self = $(this);
		
		self.attr('src', self.attr('src').replace(/\d\./, defaultThumb) );
		
		self.removeData('thumb');
		
		clearInterval( self.data('interval') );
		
	});*/
	
	
	var API = {
		
		watched: function(ids, $box){
			
			return $.post('/subscriptions/watched', {
				video: ids
			})
			.done(function(res){
				
				if( res && res.status ) {
					$box.fadeOut(function(){
						$box.remove();
					});
				}
				
				console.log(res);
			})
			.fail(function(){
				$box.removeClass('watched');
			});
			
		}
	};
	
});