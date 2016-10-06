export default class NavBar {

	animateClick($el)
	{
	  $el.velocity({
	    backgroundColor: '#C0C0C0',
	    borderTopColor: '#808080',
	    borderLeftColor: '#808080',
	    borderRightColor: '#D3D3D3',
	    borderBottomColor: '#D3D3D3'
	  }, {
	    duration: 150
	  }).velocity('reverse');
	}

	build()
	{
	  $('.nav-btn').click(() => this.animateClick($(this)) );
	  
	  /***   HINT   ***/
	  $('.nav-bar .btn-hint').click( event => {
	    event.preventDefault();
	    let $hintText = $('.hint-text'),
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

	  /***   NEXT   ***/
	  $('.nav-bar .btn-next').click( event => {
	    event.preventDefault();
	    gotoTask( store.currentTask + 1 );
	  });

	  /***   PREVIOUS   ***/
	  $('.nav-bar .btn-prev').click( event => {
	    event.preventDefault();
	    gotoTask( store.currentTask - 1 );
	  });

	  /***   GET TEST RESULTS   ***/
	  $('.nav-bar .btn-send').click( event => {
	    event.preventDefault();
	    store.timer.stop();
	    gotoScorepage();
	  });
	}
}

