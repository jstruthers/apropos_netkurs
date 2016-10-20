(function()
{
	var public = {};

	public.task = function(storeTask, taskId, animateClick, checkCompleted)
	{
		this.storeTask = storeTask;
		this.taskId = taskId;
		this.iconClass = 'fa fa-check-circle-o';
		this.animateClick = animateClick;
		this.checkCompleted = checkCompleted;
	}

	public.task.prototype.getParent = function()
	{
	  return $('.task_' + this.taskId);
	};

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

	public.task.prototype.buildOption = function(index, option)
	{
	  var $newOpt = $('<button class="custom-btn answer-btn" tabindex="-1"></button>'),
	      $optIcon = $('<div class="optIcon"><span class="' + this.iconClass + '"></span></div>'),
	      $optText = $('<span class="optText"'
	      + ' data-toggle="popover" data-placement="auto" data-trigger="hover" data-container="body"'
	      + ' data-content="' + option.text + '">' + option.text + '</span>');
	  
	  if (option.isSelected) { $optIcon.find('span').addClass( 'visible' ); }

	  $newOpt[0].addEventListener( "click", this.handleClick.bind(this, index), false );
	  
	  $newOpt.hover(function()
	  {
	    $(this).find('.optIcon').velocity(
	      {
	        scaleX: 1.1,
	        scaleY: 1.1,
	        backgroundColor: '#DCDCDC'
	      }, {
	        duration: 300
	      });
	  }, function()
	  {
	    $(this).find('.optIcon').velocity(
	      {
	        scaleX: 1,
	        scaleY: 1,
	        backgroundColor: '#fff'
	      }, {
	        duration: 300
	      });
	  });
	  
	  return $newOpt.append($optText, $optIcon);
	};

	public.task.prototype.init = function()
	{
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

	return public;

})();


