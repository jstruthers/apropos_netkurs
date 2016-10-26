(function() {
	var public = {};

	public.task = function(storeTask, taskId, animateClick, checkCompleted) {
		this.storeTask = storeTask;
		this.taskId = taskId;
		this.animateClick = animateClick;
		this.checkCompleted = checkCompleted;
	}

	public.task.prototype.handleClick = function(index, event)
	{
	  var $answerBtn = $(event.target).parents('.answer-btn').length
	                     ? $(event.target).parents('.answer-btn')
	                     : $(event.target);

	  this.animateClick($answerBtn);
	  
	  this.getParent().find('.optIcon span').eq(index)
	    .toggleClass( 'visible' );

	  this.checkCompleted( index, this.storeTask);
	};

	public.task.prototype.init = function()
	{
// Left and right buttons, title, subtitle

	  var $task = $( '<div class="task task_' + this.taskId + '">'),
	      $row = $('<div></div>'),
	      $header = $(  '<div class="col-xs-12">'
	                  + '<h4 class="question">'
	                  + this.storeTask.question + '</h4>'
	                  + '</div>'),
	      $body = $(  '<div class="col-xs-10 col-xs-offset-1">'
	                + '<div class="body"><div class="row">'
	                + '<div class="options col-xs-12 col-lg-7"></div>'
	                + '<img class="task-image col-xs-12 col-lg-5" src="http://placehold.it/750x450" />'
	                + '</div></div></div>');
	  
	  $task.append( $row.append( $header, $body ) );
	  
	  this.storeTask.answers.forEach( function(option, i)
	  {
	    $task.find('.options').append( this.buildOption(i, option) );
	  }.bind(this));
	  
	  return $task;
	};

	}

	return public;
})();