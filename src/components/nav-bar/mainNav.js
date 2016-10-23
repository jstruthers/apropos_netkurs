(function()
{
	var public = {};

	public.build = function(store, animateClick, gotoTask, timer, gotoScorepage, scoreNav, reset) {

	  $('.nav-btn').click( function() { animateClick($(this)); });
  
	  $('.nav-bar .btn-hint').click( function(event)
	  {
	    event.preventDefault();
	    var $hintText = $('.hint-text'),
	        maxWidth = $('.task-container').width() * 0.8;
	    $('.hint-text p').width(maxWidth - 20).text( store.tasks[store.currentTask].hint );
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
	    event.preventDefault();
	    timer.stop();
	    console.log
	    gotoScorepage(scoreNav, reset);
	  });
	}

	return public;
})();