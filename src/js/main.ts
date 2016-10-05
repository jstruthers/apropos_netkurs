import store from './store.ts'

// ***for dummy data
store.randomJSON = "js/JsonRandomTest.json";
store.langJSON = "js/lang.json";

/******************************
  AJAX CALLS
*******************************/

/******************************
  BEGIN INIT SEQUENCE
*******************************/

function init()
{
	$.getJSON(store.randomJSON).done(JSONLoaded).fail(error);
}

function error(err)
{
  console.log(err.statusText);
	console.log(err);
}

function JSONLoaded(datain)
{
  store.reset = false;
  
  store.stats = {
    testTitle: datain.Test.testInfo,
    passRequirement: datain.Test.PassRequirement,
    numTasks: datain.Test.NoOfTasks,
    durationTime: datain.Test.DurationTime,
    currentTime: datain.Test.AlertTime,
    completedTasks: 0,
  };
  
  store.themes = datain.Test.TestThemes.map( function( theme )
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

	getLanguageJSON();
}

function getLanguageJSON()
{
	$.getJSON(store.langJSON).done(langJSONLoaded).fail(error);
}

function langJSONLoaded(datain)
{
	store.langData = datain.languages;
  buildMain();
}

/******************************
  END INIT SEQUENCE
*******************************/

function loadHTML(url) {
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

function updateLanguage(langID, langBlock)
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

function buildMain()
{ 
  if (store.saveTemplate)
  {
    $("#random_test .row").html(store.saveTemplate);
  }
  
  // Add templates to DOM
  $.each(store.pages, function(index, page) {
    $('.' + page.slice(page.indexOf('/') + 1, page.indexOf('.html')))
      .empty()
      .append(loadHTML('pages/' + page));
  });
  
  $('.infopanel')

	buildInfoPanel();
  buildTasksInTheme(0);
  buildThemeSection();
	buildNavBar();

  togglePopover($('.optText, .match-label'));
  updateLanguage(store.currentLang, 'main');
  
  $('.toggle-lang').click( function()
  {
    store.currentLang = store.currentLang > 0 ? 0 : 1;
    updateLanguage(store.currentLang, 'main');
    animateClick($(this));
  });
  
  store.timer = new Timer( store.stats.durationTime, store.stats.alertTime );
}

function buildNavBar()
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

function animateClick($el)
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

function fadeTransition(config)
{
  // config (object) props = {$parent, colorTo, animateTo, optionsTo, delay, animateFrom, optionsFrom}
  config.optionsFrom.complete = function() { $('.fade-screen').remove() };
  config.$parent.append(
    $('<div class="fade-screen"'
      + ' style="z-index: 15; background-color: '
      + config.colorTo + ';"></div>'));
  
  config.$parent.find('.fade-screen')
    .velocity(config.animateTo, config.optionsTo);

  config.$parent.find('.fade-screen')
    .velocity(config.animateFrom, config.optionsFrom);
}

function formatDate()
{
  //function addZero(i, h = false) {
//	// if i = hour and language is english, convert 0-24 to 0-12
//    if (h && params.courseLang == 0 && i > 12) i -=12;
//
//    // adds leading zero
//    if (i < 10) {
//        i = "0" + i;
//    }
//    return i;
//}
}
