var Timer = require('./js/Timer');
var TaskUtility = require('./components/tasks/TaskUtility');
var ThemeUtility = require('./components/theme-list/ThemeUtility');
var ResultsUtility = require('./components/results/ResultsUtility');
var buildInfoPanel = require('./components/info-panel/info-panel');

// ***for dummy data
store.randomJSON = "js/JsonRandomTest.js";

function RandomTest() {
  this.tasks = new TaskUtility();
  this.themes = new ThemeUtility();
  this.results = new ResultsUtility();
}

RandomTest.prototype.init = function()
{
  $.getJSON(store.randomJSON).done(JSONLoaded).fail(error);
}

RandomTest.prototype.error = function(err)
{
  console.log(err.statusText);
	console.log(err);
}

RandomTest.prototype.JSONLoaded = function(datain)
{
  store.reset = false;
  store.randomJSON = datain;

  store.stats = {
    testTitle: datain.testInfo,
    passRequirement: datain.PassRequirement,
    numTasks: datain.NoOfTasks,
    durationTime: datain.DurationTime,
    currentTime: datain.AlertTime,
    completedTasks: 0,
  };
  
  store.themes = datain.TestThemes.map( function( theme )
  {
    return {
      title: theme.AThemes[0].at_title,
      description: theme.AThemes[0].at_description,
      totalCorrect: 0,
      tasks: theme.AThemes[0].Tasks.map( function( task )
      {
        return {
          id: task.task_id,
          question: task.Questions[0].q_text,
          type: task.Questions[0].qt_id,
          hint: task.task_hint,
          isCompleted: false,
          answers: task.Questions[0].Answers.map( function( answer, i )
          {
            return {
              id: i,
              isCorrect: answer.match ? answer.match : (answer.qa_score > 0 ? true : false),
              isSelected: false,
              pos: answer.qa_position,
              text: answer.qa_text
            };
          })
        };
      })
    };
  });

	this.buildMain();
}

/******************************
  END INIT SEQUENCE
*******************************/

RandomTest.prototype.loadHTML = function(url)
{
  var result = null;
  $.ajax({
    url: url,
    type: 'get',
    dataType: 'html',
    async: false,
    success: function(data) {
      result = data;

    }
  });
  return result;
}

/******************************
  UPDATE LANGUAGE
*******************************/

RandomTest.prototype.updateLanguage = function(langID, langBlock)
{
	for (var term in store.langData[langID][langBlock])
  {
    $(term).text(store.langData[langID][langBlock][term]);
  }
  
  $('.loading-screen').velocity(
    { opacity: 0 },
    { duration: 300, complete: function(el) { $(el).remove();} }
  );
}

/******************************
  BUILD MAIN
*******************************/

RandomTest.prototype.buildMain = function()
{
var self = this;

  // Add templates to DOM
  $.each(store.pages, function(index, page) {
    $('.' + page.slice(page.indexOf('/') + 1, page.indexOf('.html')))
      .empty()
      .append(loadHTML('pages/' + page));
  });
  
  $('.infopanel')

	this.buildInfoPanel();
  this.buildNavBar();
  this.tasks.buildTasksInTheme(0);
  this.themes.buildThemeSection();

  this.tasks.togglePopover($('.optText, .match-label'));
  this.updateLanguage(store.currentLang, 'main');
  
  $('.toggle-lang').click( function()
  {
    store.currentLang = store.currentLang > 0 ? 0 : 1;
    self.updateLanguage(store.currentLang, 'main');
    self.animateClick($(this));
  });
  
  store.timer = new Timer( store.stats.durationTime, store.stats.alertTime );
}

RandomTest.prototype.buildInfoPanel = function() { buildInfoPanel(); }

RandomTest.prototype.buildNavBar = function()
{
  $('.nav-btn').click( function() { animateClick($(this)); });
  
  $('.nav-bar .btn-hint').click( function(event)
  {
    event.preventDefault();
    var $hintText = $('.hint-text'),
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
}

/******************************
  UTILITY FUNCTION
*******************************/

RandomTest.prototype.animateClick = function($el)
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

var RTutil = new RandomTest();
RTutil.init();
