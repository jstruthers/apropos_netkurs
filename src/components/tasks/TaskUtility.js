(function() {
  var public = {};

  public.utility = function( store, Check, Match, Radio, animateClick ) {
    this.store = store;
    this.Check = Check.task;
    this.Match = Match.task;
    this.Radio = Radio.task;
    this.animateClick = animateClick;
  }

  /*
   * @function buildTask
   * @desc Add object property to task item in STORE,
           Initialize task object,
           Append $(task) node to DOM
   * @param {number} theme number,
            {number} task number
   */
  buildTask = function (taskNum, utility)
  {
    var task = utility.store.tasks[taskNum];

    switch( task.type ) {
      case 1 :
        task.obj = new utility.Radio( task, taskNum, utility.animateClick, utility.checkCompleted ); break;
      case 2 :
        task.obj = new utility.Check( task, taskNum, utility.animateClick, utility.checkCompleted ); break;
      case 3 :
        task.obj = new utility.Match( task, taskNum, utility.animateClick, utility.checkCompleted ); break;
    }

    var $task = task.obj.init();

    /***   RAISE FIRST TASK TO TOP   ***/
    if ( taskNum === 0 ) { $task.css('z-index', 0) }
    $('.task-container').append( $task );
    // if ( task.type === 3 ) {
    //   task.obj.componentsInit(task.obj, task.obj.getParent());
    // }
  }
   /*
   * @function togglePopover
   * @desc On window resize, check whether popover should display on mouseover
   * @param {jQuery Object Array} Array of popover $(nodes)
   */
  public.utility.prototype.togglePopover = function($arr)
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
  };
   /*
   * @function checkCompleted
   * @desc Check whether a task has been completed
           Register with the STORE
           Update left bar currently selected task
   * @param {number} The index in the answers array, property of current task
            {object} Current task object of STORE
            {array}  Passed from match tasks, [string, number]
   */
  public.utility.prototype.checkCompleted = function( answerIndex, task, matchAnswer )
  {
    var $taskMark = $('.task-mark_' + this.store.currentTask + '_' + this.store.currentTheme),
        curAnswer = task.answers[answerIndex].isSelected,
        newAnswer = task.type === 3 ? matchAnswer : true;

    if (!task.isCompleted)
    {
      task.isCompleted = true;
      task.answers[answerIndex].isSelected = newAnswer;
      this.store.stats.completedTasks += 1;
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
          this.store.stats.completedTasks -= 1;
          task.isCompleted = false;
          $taskMark.removeClass('finished');
        }
      }
    }
    $('.tasks-remaining').next().text(this.store.stats.completedTasks);
  };
  /*
   * @function buildTasks
   * @desc For each task in theme: build task,
           Attach event handler to window for toggle popovers
   * @param {number} theme number
   */
  public.utility.prototype.buildTasks = function()
  {
    var i = this.store.tasks.length - 1;
    
    $('.task').remove();

    for (i; i >= 0; i -= 1)
    {
      buildTask(i, this);
    }

    $( window ).resize( function()
    {
      this.togglePopover($('.optText, .match-label'));
    }.bind(this));
  };

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
  public.utility.prototype.goto = function( nextTaskNum, noTransition)
  {

    var nextTaskNum = parseInt(nextTaskNum),
        totalTasks = this.store.tasks.length - 1,

        dir = (nextTaskNum - this.store.currentTask) > 0 ? 1 : -1,
        offset = ( $('.task-container').width() / 2 ) * dir + 'px',

        $prev = $('.task_' + (nextTaskNum - dir)),
        $target = $('.task_' + nextTaskNum),
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
      if (typeof handleBounds(nextTaskNum, totalTasks) === 'number')
      {
        console.log('handleBounds', nextTaskNum, totalTasks);
        this.store.currentTask = handleBounds(nextTaskNum, totalTasks);
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

        this.store.currentTask = nextTaskNum;
        $('.task .custom-btn').attr('tabindex', -1);
        $target.find('.custom-btn').attr('tabindex', 0);
        $('.task-mark.selected').removeClass('selected');
        $('.task-mark_' + nextTaskNum ).addClass('selected');
      }
    }
    $disable.prop('disabled', true);
    setTimeout(function() { $disable.prop('disabled', false); }, 500 );
  };

  return public;

})();
