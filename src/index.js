import store from './js/store';
import Timer from './js/Timer';
import lang from './js/lang';
import randomJSON from './js/JsonRandomTest.json';

import infoPanelTemplate from './components/info-panel/info-panel.template.js';
import hintModalTemplate from './components/modal/hint-modal.template.js';
import scorepageTemplate from './components/results/scorepage.template.js';
import themeListTemplate from './components/theme-list/theme-list.template.js';

import Scorepage from './components/results/scorepage';
import NavBar from './components/nav-bar/nav-bar';
import buildInfoPanel from './components/info-panel/info-panel';
import TaskUtility from './components/tasks/tasks';
import ThemeListUtility from './components/theme-list/theme-list';
// ***for dummy data
store.langData = lang;

/******************************
  BEGIN INIT SEQUENCE
*******************************/

function init(datain)
{
  console.log('JSON loaded');
  console.log(store)
  store.reset = false;
  window.store = store;
  
  store.stats = {
    testTitle: datain.Test.testInfo,
    passRequirement: datain.Test.PassRequirement,
    numTasks: datain.Test.NoOfTasks,
    durationTime: datain.Test.DurationTime,
    currentTime: datain.Test.AlertTime,
    completedTasks: 0,
  };


  store.templates = {
      $infoPanel: $(infoPanelTemplate),
      $hintModal: $(hintModalTemplate),
      $scorepage: $(scorepageTemplate),
      $themeList: $(themeListTemplate)
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

  console.log('store is stocked', store);
  buildMain();
}

/******************************
  BUILD MAIN
*******************************/

function buildMain()
{
  console.log('building main');
  const nav = new NavBar(),
        results = new Scorepage(),
        tasks = new TaskUtility(),
        themes = new ThemeListUtility();
  
  console.log('utilities initialized', nav, results, tasks, themes);
  // Add templates to DOM
  // $('.info-panel').append(store.templates.$infoPanel.eq(0));

	// buildInfoPanel();
  // tasks.buildTasksInTheme(0);
  // themes.buildThemeSection();
	nav.build();
  console.log('crash here?')

  tasks.togglePopover($('.optText, .match-label'));
  store.updateLanguage(store.currentLang, 'main');
  
  $('.toggle-lang').click(() => {
    store.currentLang = store.currentLang > 0 ? 0 : 1;
    store.updateLanguage(store.currentLang, 'main');
    nav.animateClick($(this));
  });

  // $('.loading-screen').remove();

  store.timer = new Timer( store.stats.durationTime, store.stats.alertTime );
}

$( document ).ready( init(randomJSON) );
