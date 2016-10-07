module.exports Multichoice;

function Multichoice(storeTask, taskId)
{
  this.taskId = taskId;
  this.storeTask = storeTask;
  this.answers = storeTask.answers;
  this.iconCheckedClass = 'visible';
};

Multichoice.prototype.getParent = function()
{
  return $('.task' + this.taskId[0] + '_' + this.taskId[1]);
};

Multichoice.prototype.buildOption = function(index, option)
{
  var self = this,
      $newOpt = $('<button class="custom-btn answer-btn" tabindex="-1"></button>'),
      $optIcon = $('<div class="optIcon"><span class="' + this.iconClass + '"></span></div>'),
      $optText = $('<span class="optText"'
      + ' data-toggle="popover" data-placement="auto" data-trigger="hover" data-container="body"'
      + ' data-content="' + option.text + '">' + option.text + '</span>');
  
  if (option.isSelected)
  {
    $optIcon.find('span').addClass( this.iconCheckedClass );
  }

  $newOpt[0].addEventListener(
    "click",
    self.handleClick.bind(this, index),
    false
  );
  
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

Multichoice.prototype.init = function()
{
  var self = this,
      $task = $( '<div class="task task' + this.taskId[0] + '_' + this.taskId[1] + '">'),
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
  
  this.answers.forEach( function(option, i)
  {
    $task.find('.options').append(
      self.buildOption(i, option)
    );
  });
  
  return $task;
};
