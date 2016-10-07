var Multichoice = require('./Multichoice');
module.exports = Checkbox;

function Radio(taskData, taskId)
{
  Multichoice.apply(this, arguments);
  this.iconClass = 'fa fa-bullseye';
}

Radio.prototype = Object.create(Multichoice.prototype);
Radio.prototype.constructor = Radio;

Radio.prototype.handleClick = function(index, event)
{
  var $thisIcon = this.getParent().find('.optIcon span').eq(index);
  
  animateClick($thisIcon.parents('.answer-btn'));
  
  $thisIcon.addClass( this.iconCheckedClass );

  $thisIcon.parent()
    .parent()
    .siblings()
    .children('.optIcon')
    .children()
      .removeClass( this.iconCheckedClass );

  checkCompleted( index, this.storeTask );
}
