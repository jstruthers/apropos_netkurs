  
/************************************************************************************************************************
STORE OBJECT
*************************************************************************************************************************/

var store = {
  tasks : null,
  stats: null,
  currentTheme : 0,
  currentTask : 0,
  currentLang : 'english',
  totalCorrect : 0,
  reset : false,
  timer : null,
  $row: function(gutter) { return $('<div class="row ' + (gutter ? 'no-gutter' : '') + '"></div>'); },
  $col: function(s, col) { return $('<div class="col-' + s + '-' + col + '"></div'); },
  build: {
    randomTest: {
      page: './html/randomTest.html',
      json: [
        ['feed', './json/JsonRandomTest.json'],
        ['langData', './json/langData.json']
      ]
    },
    taskMaler: {
      page: './html/taskMaler.html',
      json: [
        ["feed", "./json/JsonTaskMaler.json"],
        ["langData", "./json/langData.json"]
      ]
    }
  }
},

/************************************************************************************************************************
UTILITY FUNCTIONS
*************************************************************************************************************************/

asyncLoop = function(arr, func, endLoop) {
  var i = 0,
      loop = function() {
        $.ajax({
          url: arr[i][1],
          dataType: 'text',
          error: function(err) { console.log(err.responseText); },
          success: function(data) {
            if ( i < arr.length - 1) { func(i, data); i += 1; loop(); }
            else { func(i, data); endLoop(); }
          }
        });
      };
  loop();
},

updateLanguage = function(langBlock)
{
  for (var term in langBlock) { $(term).text(langBlock[term]); }
},

animateClick = function($el)
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
},

/************************************************************************************************************************
INFO PANEL
*************************************************************************************************************************/

infoPanel = function()
{
  $(".info-panel .title").text(store.stats.testTitle);

  $(".info-panel .num-tasks").next().text(store.stats.numTasks);
  
  $('.info-panel .tasks-remaining').next().text(store.stats.completedTasks);

  $(".info-panel .pass-requirement").next().text(store.stats.passRequirement + " %");
},

/************************************************************************************************************************
  APPEND RANDOM TEST NAV-BAR EVENT LISTENERS
*************************************************************************************************************************/

randomTestNav = function()
{
  $(store.testId + ' .nav-btn').click( function() { animateClick($(this)); });

  $(store.testId + ' .nav-bar .btn-hint').click( function(event)
  {
    event.preventDefault();
    var $hintText = $(store.testId + ' .hint-text'),
        maxWidth = $(store.testId + ' .task-container').width() * 0.8;
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
    store.timer.stop();
    gotoScorepage();
  });
},

/************************************************************************************************************************
  APPEND SCORE NAV-BAR EVENT LISTENERS
*************************************************************************************************************************/

scoreNav = function() {

  $(store.testId + ' #retryModal').on('hidden.bs.modal', function()
  {
    if (store.reset) {
      $(store.testId).html("").load(store.build.randomTest.page, initStore.bind(null, 'randomTest'));
    }
  });
  
  $('.btn-modal-retry').click( function()
  {
    store.tasks = null;
    store.stats = null;
    store.currentTask = 0;
    store.totalCorrect = 0;
    store.reset = true;
    $(store.testId + ' #retryModal').modal('hide');
  });
},

/************************************************************************************************************************
  APPEND TASK MALER NAV-BAR EVENT LISTENERS
*************************************************************************************************************************/

taskMalerNav = function()
{
  $(store.testId + ' .nav-btn').click( function() { animateClick($(this)); });

  $(store.testId + ' .nav-bar .btn-next').click( function(event)
  {
    event.preventDefault();
    gotoTask( store.currentTask + 1 );
  });

  $('.nav-bar .btn-prev').click( function(event)
  {
    event.preventDefault();
    gotoTask( store.currentTask - 1 );
  });
},

/************************************************************************************************************************
  RESULTS UTILITY
*************************************************************************************************************************/

gotoScorepage = function()
{
  $(store.testId).html("").load('./html/scorepage.html', function() {
    initScorepage();
    scoreNav();
  });
}

gradeTest = function()
{
  store.tasks.forEach(function(task) {
    task.correct = [];
    if (task.isCompleted) {
      task.correct = task.type < 3
        ? task.answers.map( function( answer, i )
          {
            if (answer.isCorrect) {
              if (answer.isSelected === answer.isCorrect)
              {
                answer.markRight = true; return true;
              }
              else { answer.markWrong = true; return false; }
            }
            else if (!answer.isSelected) { return true; }
          })
        : task.answers.map( function(answer)
          {
            if (answer.isSelected[0] === answer.isCorrect)
            {
              answer.markRight = true; return true;
            }
            else {
              if (!answer.isSelected) {
                answer.isSelected = store.langData[store.currentLang].misc.matchIncomplete;
              }
              answer.markWrong = true; return false;
            }
          });
    } else { task.correct.push(false); }

    task.correct = task.correct.reduce( function( prev, curr ) { return prev && curr  }, true);

    if (task.correct) { store.totalCorrect += 1; }
  });
},

buildAnswerKey = function()
{
  var $keyWrapper = $('<div class="col-xs-12"></div>');
  
  gradeTest();

  store.tasks.forEach( function( task )
  {
    var $qHeader = $keyWrapper.clone().append($(
                      '<div class="question">'
                      + '<p><span class="first-label">Task ID:</span> ' + task.id + '</p>'
                      + '<p><span class="second-label">Question:</span> ' + task.question + '</p>'
                      + '</div>')),

        getIcon = function(check)
        {
          if (task.type === 2)
            { if (check) { return 'fa-check-square-o'; } else { return 'fa-square-o'; }
          } else if (task.type === 1)
            { if (check) { return 'fa-circle'; } else { return 'fa-circle-o'; }
          } else { return ''; }
        },
        fillCell = task.type < 3
          ? function($parent, answer, key)
            {
              $parent.append(
                '<p>' + (!key && answer.markWrong ? '<span class="fa fa-close"></span>' : '')
                + (!key && answer.markRight ? '<span class="fa fa-check"></span>' : '')
                + '<span class="fa ' + getIcon((key ? answer.isCorrect : answer.isSelected))
                + '"></span>' + answer.text + '</p>');
            }
          : function($parent, answer, key)
            {
              $parent.append(
                '<p>' + (!key && answer.markWrong ? '<span class="fa fa-close"></span>' : '')
                + (!key && answer.markRight ? '<span class="fa fa-check"></span>' : '')
                + '<span class="match-result">' + answer.text + '</span><br />'
                + '<span class="match-result">' + (key ? answer.isCorrect : answer.isSelected[0])
                + '</span></p>');
            },
        $answerContainer = $('<div class="answer-container"></div>'),
        $answerWrapper = $('<div class="col-sm-6 col-xs-12"></div>'),
        $answer = $answerWrapper.clone().append($('<h4 class="answer-heading first-label">Your Answer:</h4>')),
        $correct = $answerWrapper.clone().append($('<h4 class="answer-heading second-label">Correct Answer:</h4>'));
    
    task.answers.forEach( function( answer ) {
      fillCell( $correct, answer, true); });
    
    if ( task.isCompleted ) {
      task.answers.forEach( function( answer ) {
        fillCell( $answer, answer, false); });
    } else { $answer.append(
      $('<p class="incomplete"><span class="fa fa-close"></span>'
        + '<span class="incomplete-text">'
        + 'This question was left incomplete</span></p>'));
    }

    var $qBody = $keyWrapper.clone().append(
        $answerContainer.append(
            store.$row().append(
                $answer, $correct )));
    $(store.testId + ' #answerModal .modal-body').append(
        store.$row().append( $qHeader, $qBody ));
                
  });
},

handleTotalBar = function()
{

//***   BUILD TOTAL BAR   ***//
  
  $(store.testId + ' .total-bar').append($('<svg class="svg-progress-bar" viewBox="0 0 100 100">'
      + ' <g><path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
      + ' <path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
      + ' <text class="percent-completed" text-anchor="middle" x="50%" y="55%">0%</text></g></svg>'));
  
//***   GET TOTAL FILL VALUE   ***//

  var len = $(store.testId + ' .total-bar path:nth-child(2)')[0].getTotalLength(),
      totalFactor = store.totalCorrect ? store.totalCorrect / store.stats.numTasks : 0,
      totalFill = len - (len * totalFactor);

  $(store.testId + ' .total-bar path:nth-child(2)').css(
    {'stroke-dasharray': len + ',' + len, 'stroke-dashoffset': len}
  );
  
//***   ANIMATE BARS   ***//

  var trackProgress = function($el, f, el, c) { $el.text( Math.floor(f * c * 100) + '%'); };
  
  $(store.testId + ' .total-bar path:nth-child(2)')
    .velocity({ 'stroke-dashoffset': totalFill },
    {
      duration: 1000,
      delay: 1500,
      progress: trackProgress.bind( null,
        $('.total-bar .percent-completed'), totalFactor
      )
    });
},

initScorepage = function()
{ 
  buildAnswerKey();

  var $timeResult = $(
    '<h4><span class="time-result-heading">Time taken: </span>'
    + '<span class="time-result">&nbsp;' + store.timer.timeString + '</span></h4>');

  $(store.testId + ' .task-stats').append($timeResult);
  
  handleTotalBar();
  
  updateLanguage(store.langData[store.currentLang].results);
  $('.toggle-lang').remove('click');
  $('.toggle-lang').click( function()
  {
    store.currentLang = store.currentLang === 'english' ? 'norwegian' : 'english';
  
    updateLanguage(store.langData[store.currentLang].results);
    $(store.testId + ' .time-result').text(' ' + store.timer.formatTime('l'));
    animateClick($(this));
  });
},

/************************************************************************************************************************
  TASK UTILITY FUNCTIONS
*************************************************************************************************************************/

/*
 * @function buildTask
 * @desc Add object property to task item in STORE,
         Initialize task object,
         Append $(task) node to DOM
 * @param {number} theme number,
          {number} task number
 */
createTask = function (themeNum, taskNum)
{
  var task = store.themes[themeNum].tasks[taskNum];

  switch( task.type ) {
    case 1 :
      task.obj = new Radio( task, taskNum ); break;
    case 2 :
      task.obj = new Checkbox( task, taskNum ); break;
    case 3 :
      task.obj = new Match( task, taskNum ); break;
    case 4 :
      task.obj = new Explore( task, taskNum ); break;
    case 5 :
      task.obj = new Slideshow( task, taskNum ); break;
    case 6 :
      task.obj = new Sorting( task, taskNum ); break;
    case 7 :
      task.obj = new Standard( task, taskNum ); break;
    default: break;
  }

  var $task = task.obj.init();

  /***   RAISE FIRST TASK TO TOP   ***/
  if ( taskNum === 0 ) { $task.css('z-index', 0) }
  $(store.testId + ' .task-container').append( $task );
  if ( task.type === 3 || task.type === 6) {
    task.obj.componentsInit();
  }
},
 /*
 * @function togglePopover
 * @desc On window resize, check whether popover should display on mouseover
 * @param {jQuery Object Array} Array of popover $(nodes)
 */
togglePopover = function($arr)
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
},
 /*
 * @function checkCompleted
 * @desc Check whether a task has been completed
         Register with the STORE
         Update left bar currently selected task
 * @param {number} The index in the answers array, property of current task
          {object} Current task object of STORE
          {array}  Passed from match tasks, [string, number]
 */
checkCompleted = function( answerIndex, task, matchAnswer )
{
  var $taskMark = $('.task-mark_' + store.currentTask),
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
},
/*
 * @function buildTasks
 * @desc For each task, build task object and append relevent HTML,
         Attach event handler to window for toggle popovers
 * @param {number} theme number
 */
buildThemePanel = function(themeTitle, accordionTitle)
{
  return $('<div class="panel panel-default theme-panel">'
    + '<div class="panel-heading theme-panel-heading" data-toggle="collapse" data-parent="' + accordionTitle + '" href="#' + themeTitle + '">'
    +    themeTitle
    + '</div>'
    + '<div id="' + themeTitle + '" class="panel-collapse collapse">'
    +   '<div class="task-mark-container"> </div>'
    + '</div></div>');
},

addTaskDots = function( themeIndex, numTasks, themeTitle)
{
  var $taskMark = $('<div class="dot-group">'
    + '<button class="task-mark unfinished"></button>'
    + '<div class="fa fa-long-arrow-right"></div>'
    + '</div>');

  for (var i = 0; i < numTasks; i += 1)
  {
    var $newMark = $taskMark.clone();
    
    $newMark.find('button').addClass('task-mark_' + i)
            .attr('data-taskNum', themeIndex + '-' + i)
            .attr('tabindex', 0)
            .click( function(e) {
                gotoTask( $(this).attr('data-taskNum') );
            });

    if (i === 0) { $newMark.children('button').addClass('selected'); }
    else if (i === numTasks - 1) { $newMark.children('.fa').remove(); }

    $(store.testId + ' .theme-list #' + themeTitle + ' .task-mark-container').append( $newMark );
  }
},

appendTasks = function(themeNum)
{ 
  $(store.testId + ' .task').remove();

  for (var i = store.themes[themeNum].tasks.length - 1; i >= 0; i -= 1)
  {
    createTask(themeNum, i, this);
  }

  $( window ).resize( function()
  {
    togglePopover($(store.testId + ' .optText, .match-label'));
  });
},
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
gotoTask = function( taskPos )
{
  console.log(store.themes,
    taskPos,
    parseInt(taskPos.slice(taskPos.indexOf('-') + 1)),
    parseInt(taskPos.slice(0, taskPos.indexOf('-'))));
  var nextTaskNum = parseInt(taskPos.slice(taskPos.indexOf('-') + 1)),
      nextThemeNum = parseInt(taskPos.slice(0, taskPos.indexOf('-'))),
      totalTasks = store.themes[nextThemeNum].tasks.length - 1,

      dir = (nextTaskNum - store.currentTask) > 0 ? 1 : -1,
      offset = ( $(store.testId + ' .task-container').width() / 2 ) * dir + 'px',

      $prev = $(store.testId + ' .task_' + store.currentTask),
      $target = $(store.testId + ' .task_' + nextTaskNum),
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

  if (typeof handleBounds(nextTaskNum, totalTasks) === 'number')
  {
    store.currentTask = handleBounds(nextTaskNum, totalTasks);
  }
  else
  {
    $prev.append('<div class="fade-screen"></div>');
    $(store.testId + ' .task').css('z-index', -2);
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

    store.currentTask = nextTaskNum;
    store.currentTHeme = nextThemeNum;

    if (store.currentTask > 0) {
      $('.btn-prev').attr('disabled', false);
    } else {
      $('.btn-prev').attr('disabled', true);
    }

    if (store.currentTask < totalTasks) {
      $('.btn-next').attr('disabled', false);
    } else {
      $('.btn-next').attr('disabled', true);
    }

    $(store.testId + ' .task .custom-btn').attr('tabindex', -1);
    $target.find('.custom-btn').attr('tabindex', 0);

    $(store.testId + ' .task-mark.selected').removeClass('selected');
    $(store.testId + ' #' + store.themes[nextThemeNum].title + ' .task-mark_' + nextTaskNum ).addClass('selected');
    console.log($(store.testId + ' #' + store.themes[nextThemeNum].title + ' .task-mark_' + nextTaskNum ));
  }
},

/************************************************************************************************************************
  BUILD ORDERS
*************************************************************************************************************************/

/************************************************************************************************************************
  BUILD RANDOM TEST
*************************************************************************************************************************/

  buildRandomTest = function()
  {
    infoPanel();

    appendTasks(0);

    randomTestNav();

    togglePopover($(store.testId + ' .optText, ' + store.testId + ' .match-label'));
    
    updateLanguage(store.langData[store.currentLang].randomTest);
    $('.toggle-lang').click( function()
    {
      store.currentLang = store.currentLang === 'english' ? 'norwegian' : 'english';
      updateLanguage(store.langData[store.currentLang].randomTest);
      animateClick($(this));
    });

    store.timer = new Timer();
    store.timer.start();
  },

  buildTaskMaler = function()
  {
    appendTasks(0);

    taskMalerNav();
// add in hotSpot popover
    togglePopover($(store.testId + ' .optText, ' + store.testId + ' .match-label'));

    updateLanguage(store.langData[store.currentLang].randomTest);
    $('.toggle-lang').click( function()
    {
      store.currentLang = store.currentLang === 'english' ? 'norwegian' : 'english';
      updateLanguage(langData[store.currentLang].randomTest);
      animateClick($(this));
    });
  },

  initStore = function(buildOrder)
  {
    $(store.testId).parent().siblings('.loading-screen').velocity({
      opacity: 0
    }, { duration: 200, complete: function() { $(store.testId).parent().siblings('.loading-screen').hide() }});

    if (!store.$testPage) { store.$testPage = $(store.testId).html(); }

    var accordionId = store.testId + '_theme_accordion';

    $(store.testId + ' .theme-list').append(
      $('<div class="panel-group theme-accordion" id="' + accordionId.slice(1) + '"></div>'));

    if (buildOrder === 'randomTest')
    {
      store.stats = {
        testTitle: store.feed.testInfo,
        passRequirement: store.feed.PassRequirement,
        numTasks: store.feed.NoOfTasks,
        durationTime: store.feed.DurationTime,
        alertTime: store.feed.AlertTime,
        completedTasks: 0,
        totalCorrect: 0
      };
    }

    store.themes = store.feed.TestThemes[0].AThemes.map( function(theme, i) {
      $(store.testId + ' .panel-group').append(
        buildThemePanel(theme.at_title, accordionId));
      addTaskDots( i, theme.Tasks.length, theme.at_title );
      return {
        title: theme.at_title,
        tasks: theme.Tasks.map( function(task, i) {
          switch (buildOrder) {
            case 'randomTest':
              return {
                id: task.task_id,
                question: task.Questions[0].q_text,
                type: task.Questions[0].qt_id,
                hint: task.task_hint,
                isCompleted: false,
                answers: task.Questions[0].Answers.map( function( answer, i ) {
                  return {
                    id: i,
                    isCorrect: answer.match ? answer.match : (answer.qa_score > 0 ? true : false),
                    isSelected: false,
                    pos: answer.qa_position,
                    text: answer.qa_text
                  };
                })
              };
            case 'taskMaler':
              return {
                title: task.Title,
                type: task.PresentationTemplates[0].presentationtemplate_id,
                isCompleted: false,
                testquestion: (task.Questions && task.Questions[0].testquestion) ? task.Questions[0].testquestion : null,
                testposition: (task.Questions && task.Questions[0].position) ? task.Questions[0].position : null,
                answers: (function() {
                  switch(task.PresentationTemplates[0].presentationtemplate_id) {
                    case 4:
                    //explore
                      return task.Questions.map(function(q) {
                        return {
                          text: q.Answers[0].testanswer,
                          img: q.Attachments[0] ? q.Attachments[0].att_url : null,
                          label: q.testquestion
                        };
                      });
                    case 7:
                    //text and picture
                      return {
                        text: task.PText,
                        img: task.PageAttachments[0] ? task.PageAttachments[0].att_url : null
                      };
                    case 5:
                    //slideshow
                      return {
                        text: task.PText,
                        slides: task.Questions[0].Attachments.map(function(a) {
                          return {
                            img: a.url,
                            dims: a.dims,
                            alt: a.alt
                          }
                        })
                      }
                    case 1:
                    //multichoice
                      return task.Questions[0].Answers.map(function(a) {
                        return {
                          text: a.testanswer,
                          pos: a.position,
                        }
                      });
                    case 3:
                    //match
                      return task.Questions.map(function(q) {
                        return {
                          text: q.Answers[0].testanswer,
                          matchText: q.testquestion,
                          img: q.Attachments[0] ? q.Attachments[0].att_url : null
                        }
                      })
                    case 6:
                    //sorting
                      return {
                        img: task.PageAttachments[0].att_url,
                        bins: task.Questions.map(function(q, i) {
                          return {
                            binId: i + 1,
                            sortables: q.Answers.map(function(a) {
                              return {
                                label: a.testanswer,
                                bin: a.position
                              }
                            }),
                            binImg: q.Attachments[0] ? q.Attachments[0].att_url : null,
                            binLabel: q.testquestion
                          }
                        })
                      }
                    default: break;
                  }
                })()
              };
            default: break;
          };
        })
      };
    });

    console.log(store.themes);

    store.reset = false;

    if (buildOrder === 'randomTest') { buildRandomTest(); }
    else { buildTaskMaler(); }
  };

/************************************************************************************************************************
  TASK OBJECTS
*************************************************************************************************************************/

/************************************************************************************************************************
  MULTIPLE CHOICE SUPER CLASS
*************************************************************************************************************************/

function MultiChoice(storeTask, taskId)
{
  this.storeTask = storeTask;
  this.taskId = taskId;
  this.iconClass = null;
}

MultiChoice.prototype.getParent = function()
{
  return $(store.testId + ' ' + ' .task_' + this.taskId);
};

MultiChoice.prototype.buildOption = function(index, option)
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
    $(this).find('.optText').css({ textDecoration: 'underline' });
  }, function()
  {
    $(this).find('.optText').css({ textDecoration: 'none' });
  });
  
  return $newOpt.append($optText, $optIcon);
};

MultiChoice.prototype.init = function()
{
  var $task = $('<div class="task task_' + this.taskId + ' ' + this.type + '">'),
      $header = $(  '<div class="col-xs-12">'
                  + '<h4 class="question">'
                  + this.storeTask.title + '</h4>'
                  + '</div>'),
      $body = $(  '<div class="col-xs-10 col-xs-offset-1">'
                + '<div class="body"><div class="row">'
                + '<div class="options col-xs-12 col-lg-7"></div>'
                + '<img class="task-image col-xs-12 col-lg-5" src="http://placehold.it/750x450" />'
                + '</div></div></div>');
  
  $task.append( $('<div></div>').append( $header, $body ) );
  
  this.storeTask.answers.forEach( function(option, i)
  {
    $task.find('.options').append( this.buildOption(i, option) );
  }.bind(this));
  
  return $task;
};

/************************************************************************************************************************
TASK: CHECKBOX
*************************************************************************************************************************/

function Checkbox(storeTask, taskId)
{
  MultiChoice.call(this, storeTask, taskId);
  this.iconClass = 'fa fa-check';
  this.type = 'checkbox';
}

Checkbox.prototype = Object.create(MultiChoice.prototype);
Checkbox.prototype.constructor = Checkbox;

Checkbox.prototype.handleClick = function(index, event)
{
  var $answerBtn = $(event.target).parents('.answer-btn').length
                     ? $(event.target).parents('.answer-btn')
                     : $(event.target);

  animateClick($answerBtn);
  
  this.getParent().find('.optIcon span').eq(index)
    .toggleClass( 'visible' );

  checkCompleted( index, this.storeTask );
};

/************************************************************************************************************************
TASK: RADIO
*************************************************************************************************************************/

function Radio(storeTask, taskId)
{
  MultiChoice.call(this, storeTask, taskId);
  this.iconClass = 'fa fa-circle';
  this.type = 'radio';
};

Radio.prototype = Object.create(MultiChoice.prototype);
Radio.prototype.constructor = Radio;

Radio.prototype.handleClick = function (index, event)
{
  var $thisIcon = this.getParent().find('.optIcon span').eq(index);
  
  animateClick($thisIcon.parents('.answer-btn'));
  
  $thisIcon.addClass( 'visible' );

  $thisIcon.parent()
    .parent()
    .siblings()
    .children('.optIcon')
    .children()
      .removeClass( 'visible' );

  checkCompleted( index, this.storeTask );
};

/************************************************************************************************************************
  TASK COMPONENTS
*************************************************************************************************************************/

/************************************************************************************************************************
  TASK COMPONENT: POPOVER
*************************************************************************************************************************/

/************************************************************************************************************************
  TASK COMPONENT: LINE
*************************************************************************************************************************/

function Line(config)
{
  this.$tab = config.$tab;
  this.$task = config.$task;
  this.$el = $('<svg class="line"'
    + '" width="' + config.$task.width() + '"'
    + '" height="' + config.$task.height()
    + '" viewPort="0 0 ' + config.$task.width() + ' ' + config.$task.height()
    + '" xmlns="http://www.w3.org/2000/svg">'
    + '<line x1="0" y1="0" x2="0" y2="0"'
    + ' stroke-width="' + (config.width ? config.width : '5px') + '"'
    + ' stroke="' + (config.color ? config.color : '#555') + '"'
    + ' stroke-linecap="' + (config.capStyle ? config.capStyle : 'round') + '"'
    + ' shape-rendering="optimizeQuality"/>'
    + '</svg>');
}

Line.prototype.set = function(x, y)
{

  this.$el.find('line')
    .attr(x[0], x[1] + this.$tab.width() / 2)
    .attr(y[0], y[1] + this.$tab.height() / 2);
};

Line.prototype.resize = function()
{
  this.$el.attr('viewPort', '0 0 ' + $('.task-container').width() + ' ' + ($('.task-container').height()));
  this.$el
    .attr('width', $('.task-container').width())
    .attr('height', $('.task-container').height());
};
  
/************************************************************************************************************************
  TASK COMPONENT: DRAGGABLE
*************************************************************************************************************************/

function Draggable(id, taskId, $el)
{
  var self = this;
  this.id = id;
  this.$el = $el;
  this.$task = $(store.testId + ' .task_' + taskId);
  this.$el.draggable({
    containment: 'parent',
    stack: '.ui-draggable'
  });
  this.$el.mouseover( self.raiseEl.bind(self) )
          .mouseout( self.lowerEl.bind(self) )
          .attr('data-id', this.id);
}

Draggable.prototype.raiseEl = function(event)
{
  this.$el.addClass('grab').velocity({
    scale: 1.2,
    boxShadowY: '5px'
  }, {
    duration: 100,
    begin: function(el) { $(el).css('cursor', 'move'); }
  });   
};

Draggable.prototype.lowerEl = function(event)
{ 
  this.$el.velocity({
    scale: 1,
    boxShadowY: 0
  }, {
    duration: 100,
    begin: function(el) { $(el).css('cursor', 'default'); }
  }).removeClass('grab');
};

// Tab.prototype.move = function(x, y)
// {
//   this.$el.css({ left: x, top: y });
//   this.match.getDims(this);
//   this.moveLine(x, y);
// };

/************************************************************************************************************************
  TASK: MATCH
*************************************************************************************************************************/

/************************************************************************************************************************
  TASK: MATCH::TAB COMPONENT
*************************************************************************************************************************/

function Tab (config)
{
  var self = this;
  Draggable.call(this,
    config.id,
    config.taskId,
    $('<div class="match-tab"></div>')
  );
  this.info = config.info;
  // this.$popover = config.$popover;
  this.$task = $(store.testId + ' .task_' + config.taskId);
  this.$row = this.$task.find('.match-label').eq(config.id);
  this.line = new Line({
    $tab: this.$el,
    $task: this.$task,
  });
  // this.$el.draggable('option', 'revert', function() {this.springBack(); return false;}.bind(this))
  //         .on('drag', this.handleDrag.bind(this));
};

Tab.prototype = Object.create(Draggable.prototype);
Tab.prototype.constructor = Tab;

Tab.prototype.setOrigin = function()
{
  this.origin = {
    x: this.$row.offset().left + this.$row.width() - this.$task.offset().left + 23,
    y: this.$row.offset().top - this.$task.offset().top - this.$task.scrollTop() + 5
  };

  this.line.set(['x1', this.origin.x], ['y1', this.origin.y]);
  
  // this.$popover.css({
  //   left: this.$row.offset().left - this.$task.offset().left,
  //   top: this.$row.offset().top - this.$task.offset().top,
  //   width: this.$row.width() + 20,
  //   height: this.$row.parent().height()
  // });
};

Tab.prototype.handleDrag = function(e, ui)
{
    this.line.set(
      ['x2', parseFloat(e.target.style.left)],
      ['y2', parseFloat(e.target.style.top)]
    );
};

Tab.prototype.springBack = function()
{ 
  console.log('spring back');
  var self = this;
  this.$el.velocity({
    left: self.origin.x + 'px',
    top: self.origin.y + 'px',
  }, {
    duration: 1000,
    easing: [150, 15],
    progress: function(e) {
      self.line.set(
        ['x2', parseFloat($(e).css('left'))],
        ['y2', parseFloat($(e).css('top'))]
      );
    }
  });
};

Tab.prototype.init = function()
{
  var self = this;
  this.$task.append(this.$el, this.line.$el);
  this.setOrigin();
  this.$el.css({ left: this.origin.x, top: this.origin.y });
  this.line.set(['x2', this.origin.x], ['y2', this.origin.y]);
  // this.bindHandlers();
  // if (this.covering)
  // {
  //   this.move(
  //       this.covering.bounds[3] - this.$task.offset().left + 5,
  //       this.covering.bounds[0] - this.$task.offset().top + 5)
  // } else {
  //   this.move(this.origin.x, this.origin.y);
  // }
};

/************************************************************************************************************************
  TASK: MATCH::SLOT COMPONENT
*************************************************************************************************************************/

function Slot(config)
{
  this.id = config.id;
  this.$task = $(store.testId + ' .task_' + config.taskId);
  this.$el = this.$task.find('.slot-container .tab-slot').eq(config.idid);
  this.$el.droppable({});
  this.parentObj = config.parentObj;
  // this.$el
  //   .on('drop', this.handleDrop.bind(this))
  //   .on('dropout', this.handleOut.bind(this))
  //   .on('dropover', this.handleOver.bind(this, '#0FF'));
}

Slot.prototype.handleDrop = function(ev, ui)
{

  console.log('dropping on drop');
  if (!this.covering)
  {
    var left = this.$el.offset().left - this.$task.offset().left + 5,
        top = this.$el.offset().top - this.$task.offset().top + 5;

    this.covering = this.parentObj.tabs[$(ui.draggable).attr('data-id')];

    this.covering.line.set(['x2', left], ['y2', top]);

    $(ui.draggable).css({ top: top, left: left })
                   .draggable('option', 'revert', false);

    this.$el.next().velocity('reverse', { duration: 100 });
  }
};

Slot.prototype.handleOut = function(ev, ui)
{
  console.log('handle Out on drop');
  if (this.covering && $(ui.draggable).attr('data-id') === this.covering.$el.attr('data-id'))
  {
    $(ui.draggable).draggable('option', 'revert', this.covering.springBack.bind(this.covering));
    this.covering = false;
  }
  else if (!this.covering)
  {
    this.$el.next().velocity('reverse', { duration: 100 });
  }

};

Slot.prototype.handleOver = function(color, ev, ui)
{
  console.log('hovering on drop')
  if (!this.covering)
  {
    this.$el.next().velocity({ borderLeftColor: color }, { duration: 100 });
  }
};

/************************************************************************************************************************
  TASK: MATCH OBJECT
*************************************************************************************************************************/

function Match( storeTask, taskId ) {
  this.taskId = taskId;
  this.storeTask = storeTask;
  this.answers = storeTask.answers.map( function( a, i ) { return {text: a.text, info: a, id: i} });
  this.slots = storeTask.answers.map( function( a ) { return {text: a.matchText} });
}

Match.prototype.handleResize = function()
{
  console.log('handleResize')
  var self = this;
  this.tabs.forEach( function(t, i) {
    t.setOrigin();
    t.line.set(['x1', t.origin.x], ['y1', t.origin.y]);
  });

  this.move( this.origin.x, this.origin.y );
  this.match.slots.forEach( self.handleSlotResize.bind(self));
}

Match.prototype.init = function()
{
  var self = this,
      $task = $('<div class="task task_' + this.taskId + '">'),
      $aContainer = $( '<div class="col-sm-6 col-xs-12">'
        + '<div class="answer-container"></div></div>'),
      $sContainer = $( '<div class="col-sm-5 col-xs-12">'
        + '<div class="slot-container"></div></div>'),
      $popover = $('<div class="match-popover"'
        + 'data-toggle="popover" data-placement="auto" data-trigger="hover" data-container="body"></div>');
  
  function makeTile(obj, type, id)
  {
    var $newLabel = $('<p class="match-label"></p>').text(obj.text).attr('data-id', id),
        $newPopover = $popover.clone().attr('data-content', obj.text).attr('data-id', id),
        $newTile = type > 0
          ? store.$row().append(
              $('<img></img>'),
              $newLabel,
              $('<div class="tab-slot"></div>'))
          : store.$row().append(
              $('<div class="tab-slot"></div>'),
              $newLabel);
    obj.$popover = $newPopover;
    return store.$col('xs', 12).clone().append( $newTile );
  }
  
  this.slots.forEach( function( slot, i )
  {
    $aContainer.find('.answer-container').append( makeTile( self.answers[i], 1, 'a_' + i));
    $sContainer.find('.slot-container').append( makeTile( slot, 0, 's_' + i));
  });

  $task.append(
    $('<div class="col-xs-12"></div>').append(
      $('<div class="match-container"></div>').append(
        store.$row().append(
          $('<div class="col-xs-12"></div>').append(
            $('<h4>' + this.storeTask.title + '</h4>'))),
        store.$row().append(
          $aContainer, $('<div class="col-sm-1 col-xs-0"></div>'), $sContainer))));
  
  return $task;
};

/***   CREATE SLOT AND TAB OBJECTS    ***/

Match.prototype.componentsInit = function()
{
  this.tabs = this.slots.map( function(slot, i)
  {
    var a = this.answers[i],
        tab = new Tab({
          info: a.info,
          id: a.id,
          taskId: this.taskId,
          $popover: a.$popover
        });

    this.slots[i] = new Slot({
      id: i,
      taskId: this.taskId,
      parentObj: this
    });
    return tab;
  }.bind(this));
  
  this.tabs.forEach( function(tab) {
    tab.covering = tab.info.isSelected
      ? this.slots[tab.info.isSelected[1]]
      : false;
    tab.init();
  }.bind(this));
};

/************************************************************************************************************************
TASK: STANDARD
*************************************************************************************************************************/

function Standard(storeTask, taskId)
{
  this.storeTask = storeTask;
  this.taskId = taskId;
  this.img = this.storeTask.answers.img;
  this.text = this.storeTask.answers.text;
}

Standard.prototype.init = function()
{
  var $task = $('<div class="task task_' + this.taskId + ' standard"></div>');

  return $task.append(
    $('<h4 class="title sub-header">' + this.storeTask.title + '</h4>'),
    $('<div class="content">'
        + '<img src="' + this.img + '"/>'
        + '<p>' + ( typeof this.text === 'string' ? this.text : this.text.map(function(t) {return t + '<br /><br />'} ))
        + '</p></div></div>'
      )
    );
};

/************************************************************************************************************************
TASK: EXPLORE
*************************************************************************************************************************/

function Explore(storeTask, taskId)
{
  this.storeTask = storeTask;
  this.taskId = taskId;
  this.img = {
    alt: 'A Picture',
    w: 150,
    h: 150
  };
}

Explore.prototype.getParent = function()
{
  return $(store.testId + ' .task_' + this.taskId);
}

Explore.prototype.buildOption = function(o, i)
{
  console.log(o);
  var self = this,
      modalId = 'exploreTask_' + this.taskId +'_Opt_' + i;
  return {
    $li: $('<li class="option"><span class="dot empty"></span>' + o.label + '</li>')
           .click(function() {
              var $li = self.getParent().find('.menu li');
              self.getParent().find('.content').html('')
                 .append( self.options[i].$content );
              $li.find('.dot').removeClass('filled');
              $li.eq(i).find('.dot').addClass('filled');
           }),
    $content: $('<h4 class="title sub-header">' + o.label + '</h4>'
      + '<img src="http://placehold.it/' + this.img.w * 3 + 'x' + this.img.h * 2 + '"'
          + ' width="150px"'
          + ' alt="' + this.img.alt + '"'
          + ' data-target="#imageModal"'
          + ' data-src="http://placehold.it/' + this.img.w * 3 + 'x' + this.img.h * 2 + '"'
          + ' data-title="' + this.img.alt + '"'
          + ' data-toggle="modal"'
          + ' tabindex="0"/>'
      + '<p>' + (typeof o.text === 'string' ? o.text : o.text.map(function(t) {return t + '<br /><br />'} )) + '</p>')
  };
};

Explore.prototype.init = function()
{
  var $task = $('<div class="task task_' + this.taskId + ' explore"><div class="row"></div></div>');
      $left = $('<div class="col-sm-3 col-xs-12"><ul class="menu"></ul></div>'),
      $right = $('<div class="col-sm-9 col-xs-12"><div class="content"></div></div>');

  $('#imageModal').on('show.bs.modal', function(e) {
    var $img = $(e.relatedTarget).clone(),
        title = $img.data('title'),
        src = $img.data('src');
    $img.attr('width', '100%').attr('height', 'auto');
    $(this).find('.modal-title').text(title);
    $(this).find('.modal-body').html('').append($img);
  });

  this.options = this.storeTask.answers.map(function(o, i) {
    var opt = this.buildOption(o, i);
    $left.find('.menu').append(opt.$li);
    opt.$content.find('img').css({'width': this.img.w + 'px', 'height': this.img.h + 'px'});
    return opt;
  }.bind(this));

  $right.find('.content').append( this.options[0].$content );
  $left.find('li').eq(0).find('.dot').addClass('filled');

  $task.find('.row').append($left, $right);

  return $task;
};

/************************************************************************************************************************
TASK: SLIDESHOW
*************************************************************************************************************************/

function Slideshow(storeTask, taskId)
{
  this.storeTask = storeTask;
  this.taskId = taskId;
  this.slides = storeTask.answers.slides;
  this.currentSlide = 0;
  this.carouselId = 'carousel_task_' + taskId;
}

Slideshow.prototype.buildCarousel = function() {
  return $('<div id="' + this.carouselId + '" class="carousel slide" data-ride="carousel" data-interval="false">'
    + '<ol class="carousel-indicators"></ol>'
    + '<div class="carousel-inner" role="listbox" style=" width:100%; height: 425px !important;"></div>'
    + '<a class="left carousel-control" href="#' + this.carouselId + '" role="button" data-slide="prev">'
      + '<span class="icon-prev" aria-hidden="true"></span>'
      + '<span class="sr-only">Previous</span>'
    + '</a>'
    + '<a class="right carousel-control" href="#' + this.carouselId + '" role="button" data-slide="next">'
      + '<span class="icon-next" aria-hidden="true"></span>'
      + '<span class="sr-only">Next</span>'
    + '</a>'
  + '</div>');
}

Slideshow.prototype.makeSlide = function(s, i)
{
  var isActive = i === 0 ? 'active' : '',
      $img = $('<img src="' + s.img + '">')
        .css({
          position: 'relative',
          margin: 'auto',
          width: 'auto',
          maxHeight: '425px'
        }),
      $caption = $('<div class="carousel-caption"><p>' + s.alt + '</p></div>');
  return {
    $item: $('<div class="item" style="width: 100%;"></div>').addClass(isActive).append($img, $caption),
    $indicator: $('<li data-target="#' + this.carouselId + '" data-slide-to="' + i + '"></li>').addClass(isActive)
  };
};

Slideshow.prototype.init = function()
{
  var $task = $('<div class="task task_' + this.taskId + ' slideshow">'),
      $header = $('<h4 class="title sub-header">' + this.storeTask.title + '</h4>'),
      $carousel = this.buildCarousel();
  
  this.slides.forEach( function(s, i) {
    var slide = this.makeSlide(s, i);
    $carousel.find('.carousel-inner').append(slide.$item);
    $carousel.find('.carousel-indicators').append(slide.$indicator);
  }.bind(this));

  return $task.append($header, $carousel);
};

/************************************************************************************************************************
TASK: SORTING
*************************************************************************************************************************/

/************************************************************************************************************************
TASK: TASK UTILITY::SORTABLE
*************************************************************************************************************************/

function Sortable (config)
{
  var self = this;
  Draggable.call(this,
    config.id,
    config.taskId,
    config.$el
  );
  // this.$popover = config.$popover;
  this.$task = store.testId + ' .task_' + config.taskId;
  this.binMatch = config.binMatch;
  this.returning = false;
  this.sorted = false;
  config.$el.on('dragstop', this.handleDrop.bind(this))
            .on('dragstart', this.handleDrag.bind(this));
};

Sortable.prototype = Object.create(Draggable.prototype);
Sortable.prototype.constructor = Sortable;

Sortable.prototype.handleDrag = function(event, ui)
{
  this.grabbedAt = {
    x: event.clientX - ui.offset.left - 10,
    y: event.clientY - ui.offset.top + $(window).scrollTop() - 5
  };
};

Sortable.prototype.handleDrop = function(event, ui)
{
  if (this.returning)
  {
    var $parent = $(this.$task).find('.body');

    this.origin.x = event.clientX - $parent.offset().left - this.grabbedAt.x;
    this.origin.y = event.clientY - $parent.offset().top + $(window).scrollTop() - this.grabbedAt.y;

    $parent.append(
      this.$el.css({
        position: 'absolute',
        left: this.origin.x,
        top: this.origin.y
      }).detach()
    );
    this.returning = false;
  }
};

Sortable.prototype.init = function() {
  // some random point within parent
  var margin = 50,
      xMax = this.$el.parent().width() * 0.5 - margin,
      yMax = this.$el.parent().height() - margin,
      left = Math.floor(Math.random() * (xMax - margin)) + margin,
      top = Math.floor(Math.random() * (yMax - margin)) + margin

  this.$el.css({ left: left, top: top, position: 'absolute' });
  this.origin = {x: left, y: top};
};

/************************************************************************************************************************
TASK: TASK UTILITY::BIN
*************************************************************************************************************************/

function Bin(config)
{
  this.id = config.id;
  this.img = config.img;
  this.$task = store.testId + ' .task_' + config.taskId;
  this.$el = config.$el;
  this.$el.droppable({});
  this.parentObj = config.parentObj;
  this.inventory = [];
  this.$el
    .on('drop', this.handleDrop.bind(this))
    .on('dropout', this.handleOut.bind(this))
    .on('dropover', this.handleOver.bind(this, '#0FF'));
}

Bin.prototype.handleDrop = function(ev, ui)
{
  var $draggable = $(ui.draggable).detach().css({
        position: 'relative',
        top: 0,
        left: 0,
      });

  this.inventory.push($(ui.draggable).attr('data-id'));
  this.parentObj.sortables[$(ui.draggable).attr('data-id')].sorted = true;
    
  this.$el.append($draggable)
          .velocity('reverse');
};

Bin.prototype.handleOut = function(ev, ui)
{
  var index = $(ui.draggable).attr('data-id'),
      check = this.inventory.indexOf(index);

  if (check >= 0) {
    this.inventory.splice(check, 1);
    this.parentObj.sortables[index].returning = true;
    this.parentObj.sortables[index].sorted = false;
  }
  this.$el.velocity('reverse');
};

Bin.prototype.handleOver = function(color, ev, ui)
{
  this.$el.velocity({borderColor: color }, { duration: 300 });
};

/************************************************************************************************************************
TASK: SORTING OBJECT
*************************************************************************************************************************/

function Sorting(storeTask, taskId)
{
  this.storeTask = storeTask;
  this.taskId = taskId;
  this.bins = this.storeTask.answers.bins;
  this.sortables = (function() {
    var flattenedArr = this.bins.map(function(b) {
      return b.sortables
    });
    return [].concat.apply([], flattenedArr);
  }.bind(this))();
}

Sorting.prototype.init = function()
{
  var $task = $('<div class="task task_' + this.taskId + ' sorting">'),
      $header = $('<div class="sub-header" <h4>' + this.storeTask.title + '</div></h4>'),
      $body = $('<div class="body"></div>'),
      $bins = $('<table class="bin-container"></table>');

  this.sortables = this.sortables.map(function(s, i) {
    var sortable = new Sortable({
      id: i,
      taskId: this.taskId,
      binMatch: s.bin,
      $el: $('<span class="sortable sortable_' + i + '">' + s.label + '</span>')
    });
    $body.append( sortable.$el );
    return sortable;
  }.bind(this));

  this.bins = this.bins.map(function(b, i) {
    var bin = new Bin({
      id: b.binId,
      taskId: this.taskId,
      parentObj: this,
      img: b.binImg,
      $el: $('<div class="bin bin' + b.binId + '"></div>')
    });
    $bins.append(
      $('<tr></tr>').append(
        $('<td></td>').append(
          bin.$el.append(
            $('<span class="bin-label">' + b.binLabel + '</span>')
          )
        )
      )
    );
    return bin;
  }.bind(this));

  $body.append($bins);
  return $task.append(
    store.$row(1).append($header),
    store.$row(1).append($body));
};

Sorting.prototype.componentsInit = function()
{
  this.sortables.forEach( function(s, i) { s.init() });
};

/************************************************************************************************************************
TIMER
*************************************************************************************************************************/

function Timer()
{
  this.startTime = store.stats.durationTime;
  this.total = store.stats.durationTime;
  this.alertTime = store.stats.alertTime;
  this.interval = null;
  this.timeString = "";
}

Timer.prototype.fiveMinuteWarning = function()
{   
  $('.timer').velocity(
  {
    color: '#B22222',
    scale: '1.8',
    marginLeft: '25px',
    marginRight: '25px'
  }, {
    duration: 1000,
    easing: 'easeOutQuart'
  });
};

Timer.prototype.formatTime = function( opt )
{
  var tHours = Math.floor(this.total / 3600000),
      tMins = Math.floor(this.total / 60000),
      tSecs = Math.floor(this.total / 1000),
      mins = tMins % 60,
      secs = Math.floor(this.total % 60000 / 1000);
  
  if (tHours < 10) { tHours = "0" + tHours};
  if (mins < 10) { mins = "0" + mins };
  if (secs < 10) { secs = "0" + secs };
  
  switch( opt )
  {
    case 's' : return mins + ' : ' + secs; break;
    case 'm' : return tHours + ' : ' + mins; break;
    case 'l' :
      var lJSON = store.langData[store.currentLang].timer,
          pFx = lJSON.pluralPostfix;
      return tHours + (tHours > 1 ? lJSON.hour + pFx : lJSON.hour)
             + ' ' + mins + (mins > 1 ? lJSON.minute + pFx : lJSON.minute)
             + lJSON.and
             + ' ' + secs + (secs > 1 ? lJSON.second + pFx : lJSON.second);
      break;
  }
};

Timer.prototype.tick = function()
{
  if (this.total === 0)
  {
    this.stop();
    $(store.testId + ' .timer').text( '00:00' );
  }
  else
  {
    if (this.total === 300000)
    {
      this.fiveMinuteWarning();
    }
    else if (this.total < 300000)
    {
      this.timeString = this.formatTime( 's' );
    }
    else
    {
      this.timeString = this.formatTime( 'm' );
    }

    $('.timer').text( this.timeString );
  }
  this.total -= 1000;
};

Timer.prototype.stop = function()
{
  clearInterval( this.interval );
  this.total = this.startTime - this.total;
  this.timeString = this.formatTime( 'l' );
};

Timer.prototype.start = function()
{
  this.timeString = this.formatTime( 'm' );
  $('.timer').text( this.timeString );
  this.interval = setInterval(this.tick.bind(this), 1000);
};

Timer.prototype.formatDate = function()
{
  //function addZero(i, h = false) {
//  // if i = hour and language is english, convert 0-24 to 0-12
//    if (h && params.courseLang == 0 && i > 12) i -=12;
//
//    // adds leading zero
//    if (i < 10) {
//        i = "0" + i;
//    }
//    return i;
//}
};

/************************************************************************************************************************
  $ DOCUMENT READY
*************************************************************************************************************************/

$('document').ready( function() {

  /************************************************************************************************************************
    INITIATE
  *************************************************************************************************************************/

  (function(buildOrder) {
    asyncLoop(
      store.build[buildOrder].json,
      function(i, data) { store[store.build[buildOrder].json[i][0]] = JSON.parse(data); },
      function() {
        store.testId = '#randomTest_' + store.feed.Id;
        $("#random_test").attr('id', store.testId.slice(1));
        $(store.testId + '.random-test-main-content').load(store.build[buildOrder].page, initStore.bind(null, buildOrder));
      }
    );
  })('taskMaler');
});


