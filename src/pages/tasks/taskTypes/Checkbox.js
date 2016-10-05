function Checkbox(taskData, taskId)
{
  Multichoice.apply(this, arguments);

  this.iconClass = 'fa fa-check-circle-o';
}

Checkbox.prototype = Object.create(Multichoice.prototype);
Checkbox.prototype.constructor = Checkbox;

Checkbox.prototype.handleClick = function(index, event)
{
  var $answerBtn = $(event.target).parents('.answer-btn').length
                     ? $(event.target).parents('.answer-btn')
                     : $(event.target);

  animateClick($answerBtn);
  
  this.getParent().find('.optIcon span').eq(index)
    .toggleClass( this.iconCheckedClass );

  checkCompleted( index, this.storeTask);
};
