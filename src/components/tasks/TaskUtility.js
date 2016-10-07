module.exports = TaskUtility;
var Checkbox = require('./taskTypes/Checkbox');
var Radio = require('./taskTypes/Radio');
var Match = require('./taskTypes/Match');

function TaskUtility() {}

 /*
 * @function togglePopover
 * @desc On window resize, check whether popover should display on mouseover
 * @param {jQuery Object Array} Array of popover $(nodes)
 */
TaskUtility.prototype.togglePopover = function($arr)
{
  $arr.each( function()
  {
    var $el = $(this).hasClass('match-label')
        ? $(this).parents('.task').find('.match-popover[data-id="' + $(this).attr('data-id') + '"]')
        : $(this);
    if (($(this)[0].offsetHeight < $(this)[0].scrollHeight
       || $(this)[0].offsetWidth < $(this)[0].scrollWidth))
    {
      $el.popover();
    }
    else { $el.popover('destroy'); }
  });
}
 /*
 * @function buildTask
 * @desc Add object property to task item in STORE,
         Initialize task object,
         Append $(task) node to DOM
 * @param {number} theme number,
          {number} task number
 */
TaskUtility.prototype.buildTask = function(themeNum, taskNum)
{
  var task = store.themes[themeNum].tasks[taskNum];
  
  switch( task.type ) {
    case 1 :
      task.obj = new Radio( task, [themeNum, taskNum] ); break;
    case 2 :
      task.obj = new Checkbox( task, [themeNum, taskNum] ); break;
    case 3 :
      task.obj = new Match( task, [themeNum, taskNum] ); break;
  }

  var $task = task.obj.init();

  /***   RAISE FIRST TASK TO TOP   ***/
  if ( taskNum === 0 ) { $task.css('z-index', 0) }
  $('.task-container').append( $task );
  if ( task.type === 3 ) {
    task.obj.componentsInit(task.obj, task.obj.getParent());
  }
}
 /*
 * @function buildTasksInTheme
 * @desc For each task in theme: build task,
         Attach event handler to window for toggle popovers
 * @param {number} theme number
 */
TaskUtility.prototype.buildTasksInTheme = function(themeNum)
{
  var i = store.themes[themeNum].tasks.length - 1;
  $( window ).off('resize');
  
  $('.task').remove();

  for (i; i >= 0; i -= 1)
  {
    buildTask(themeNum, i);
  }

  $( window ).resize( function()
  {
    togglePopover($('.optText, .match-label'));
  });
}

 /*
 * @function checkCompleted
 * @desc Check whether a task has been completed
         Register with the STORE
         Update left bar currently selected task
 * @param {number} The index in the answers array, property of current task
          {object} Current task object of STORE
          {array}  Passed from match tasks, [string, number]
 */
TaskUtility.prototype.checkCompleted = function( answerIndex, task, matchAnswer )
{
  var $taskMark = $('.task-mark_' + store.currentTask + '_' + store.currentTheme),
      curAnswer = task.answers[answerIndex].isSelected,
      newAnswer = task.type === 3 ? matchAnswer : true;

  if (!task.isCompleted)
  {
    task.isCompleted = true;
    task.answers[answerIndex].isSelected = newAnswer;
    store.stats.completedTasks += 1;
    $taskMark.addClass('finished');
  }
  else {
    if ( task.type === 1 ) {
      task.answers.forEach( function( answer, i )
      { i === answerIndex ? answer.isSelected = true : answer.isSelected = false });
    }
    if (task.type === 2 || task.type === 3)
    {
      if (task.type === 2) {
          task.answers[answerIndex].isSelected = curAnswer ? false : true; }
      else {
        task.answers[answerIndex].isSelected = matchAnswer[0] ? matchAnswer : false; }

      if (task.answers.every( function( answer ) { return !answer.isSelected}))
      {
        store.stats.completedTasks -= 1;
        task.isCompleted = false;
        $taskMark.removeClass('finished');
      }
    }
  }

  $('.tasks-remaining').next().text(store.stats.completedTasks);
}
/*
 * @function gotoTask
 * @desc Switch to a new task,
         Trigger velocity transition to shuffle z-index of .task nodes
         Register with STORE
         Update left bar currently selected task
 * @param {number} number of task requested
          {boolean} Whether to run the task change animation
                    (Shouldn't animate on theme change)
 */
TaskUtility.prototype.gotoTask = function(nextTaskNum, noTransition)
{ 
  var nextTaskNum = parseInt(nextTaskNum),
      tasksInTheme = store.themes[store.currentTheme].tasks.length - 1,

      dir = (nextTaskNum - store.currentTask) > 0 ? 1 : -1,
      offset = ( $('.task-container').width() / 2 ) * dir + 'px',

      $prev = $('.task' + store.currentTheme + '_' + (nextTaskNum - dir)),
      $target = $('.task' + store.currentTheme + '_' + nextTaskNum),
      $disable = $('#btn_next, #btn_prev, .task-mark'),
      /*
      * @function handleBounds
      * @desc Check to to see if the next task number is valid
      * @param {number} next task number,
               {number} total tasks in the current theme
      */
      handleBounds = function(taskNum, max)
      {
        if (taskNum < 0) { taskNum = 0; }
        else if (taskNum > max) { taskNum = max; }
        else { return false; }
        return taskNum;
      };

  if (!noTransition)
  {
    if (typeof handleBounds(nextTaskNum, tasksInTheme) === 'number')
    {
      store.currentTask = handleBounds(nextTaskNum, tasksInTheme);
    }
    else
    {
      $prev.append('<div class="fade-screen"></div>');
      $('.task').css('z-index', -2);
      $prev.css('z-index', - 1);
      $target.css({
        zIndex: 0,
        top: '50px',
        opacity: 0,
        left: offset
      });
      $prev.find('.fade-screen').velocity({
        opacity: 0.2,
        duration: 750
      });
      $target.velocity({
        left: '0px',
        top: '0px',
        scale: [1, 0.8],
        opacity: 1,
        duration: 750,
        easing: 'easeInQuad'
      });
      setTimeout( function() { $prev.find('.fade-screen').remove(); }, 1000);
      $('.hint-text').velocity(
        { width: 0, opacity: 0 },
        { duration: 200, easing: 'easeOut' });
    }
  }
  store.currentTask = nextTaskNum;

  $('.task .custom-btn').attr('tabindex', -1);
  $target.find('.custom-btn').attr('tabindex', 0);
  $('.task-mark.selected').removeClass('selected');
  $('.task-mark_' + nextTaskNum + '_' + store.currentTheme).addClass('selected');

  $disable.prop('disabled', true);
  setTimeout(function() { $disable.prop('disabled', false); }, 500 );
}
