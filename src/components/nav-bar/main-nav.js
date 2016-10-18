(function()
{
	var public = {};

	public.init = function(store, animateClick, gotoTask, timer, gotoScorepage) {

	  $('.nav-btn').click( function() { animateClick($(this)); });
  
	  $('.nav-bar .btn-hint').click( function(event)
	  {
	    event.preventDefault();
	    var $hintText = $('.hint-text'),
	        maxWidth = $('.task-container').width() * 0.8;
	    $('.hint-text p').width(maxWidth - 20).text( store.getCurTask().hint );
	    $hintText.css('opacity') < 1
	      ? $hintText.velocity({
	          width: maxWidth,
	          opacity: 1
	        }, { duration: 500, easing: 'easeIn' })
	      : $hintText.velocity({
	          width: 0,
	          opacity: 0
	        }, { duration: 500, easing: 'easeOut' })
	  });

	  $('.nav-bar .btn-next').click( function(event)
	  {
	    event.preventDefault();
	    gotoTask( store.currentTask + 1 );
	  });

	  $('.nav-bar .btn-prev').click( function(event)
	  {
	    event.preventDefault();
	    gotoTask( store.currentTask - 1 );
	  });

	  $('.nav-bar .btn-send').click( function(event)
	  {
	  	console.log(store)
	    event.preventDefault();
	    timer.stop();
	    gotoScorepage();
	  });
	}

	return public;
})();