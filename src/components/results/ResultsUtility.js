function ResultsUtility() {}

ResultsUtility.prototype.goto = function()
{
	store.saveTemplate = $("#random_test .row").html();
  $("#random_test .row").html("");

	$("#random_test .row").append(loadHTML("pages/results/scorepage.html"));
	
	initScorepage();
};

ResultsUtility.prototype.grade = function()
{
  store.themes.forEach( function(theme) {
    theme.tasks.forEach(function(task) {
      task.correct = [];
      if (task.isCompleted) {
        task.correct = task.type < 3
          ? task.answers.map( function( answer, i )
            {
              if (answer.isCorrect) {
                if (answer.isSelected === answer.isCorrect) {
                  answer.markRight = true;
                  return true;
                } else { answer.markWrong = true; return false; }
              }
              else if (!answer.isSelected) { return true; }
            })
          : task.answers.map( answer =>
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
            })
      } else { task.correct.push(false); }

      task.correct = task.correct.reduce( function( prev, curr ) { return prev && curr  }, true);

      if (task.correct) { theme.totalCorrect += 1; }
    });
  });
};

ResultsUtility.prototype.buildAnswerKey = function()
{
  var $keyWrapper = $('<div class="col-xs-12"></div>'),
      $keyBody = $('<div class="answer-key"></div>');
  
  this.grade();

  store.themes.forEach( function( theme )
  { 
    var $newThemeBody = $('<div class="key-theme-body"><div class="row"></div></div>');
    
    $newThemeBody.children().eq(0).append( $keyWrapper.clone().append($(
      '<h3 class="theme-title">' + theme.title + '</h3>')));
    
    theme.tasks.forEach( function( task )
    {
      $newThemeBody.children().eq(0).append( $keyWrapper.clone().append($(
        '<div class="question">'
        + '<p><span class="first-label">Task ID:</span> ' + task.id + '</p>'
        + '<p><span class="second-label">Question:</span> ' + task.question + '</p>'
        + '</div>')));

      var getIcon = function(check)
          {
            if (task.type === 2)
              { if (check) { return 'fa-check-square'; } else { return 'fa-square'; }
            } else if (task.type === 1)
              { if (check) { return 'fa-bullseye'; } else { return 'fa-circle'; }
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
      
      task.answers.forEach( function( answer )
      {
        fillCell( $correct, answer, true);
      });
      
      if ( task.isCompleted )
      {
        task.answers.forEach( function( answer )
        {
          fillCell( $answer, answer, false);
        });
      }
      else { $answer.append(
        $('<p class="incomplete"><span class="fa fa-close"></span>'
          + '<span class="incomplete-text">'
          + 'This question was left incomplete</span></p>'));
      }
      $answerContainer.append(
          $('<div class="row"></div>').append(
            $answer, $correct ));
      $newThemeBody.children().eq(0).append(
        $keyWrapper.clone().append( $answerContainer ));
          
    });
    
    $keyBody.append($newThemeBody);
  });
  
  $('#answerModal .modal-body').append( $keyBody );
}

ResultsUtility.prototype.handleProgressBars = function()
{
//***   BUILD THEME BARS   ***//

  var $themeBar = $('<svg class="svg-progress-bar" viewBox="0 0 100 4" preserveAspectRatio="none">'
        + '<path d="M 0,2 L 100,2"></path><path d="M 0,2 L 100,2"></path></svg>'),
      themeFills = [],
      totalCorrect = 0;

  store.themes.forEach( function( theme, index )
  {
    var $label = $('<h3 class="theme-label"></h3>').text(theme.title),
        $percentage = $('<span class="percent-completed">0%</span>'),
        $newThemeBar = $themeBar.clone();

//***   GET THEME FILL VALUE   ***//
    themeFills.push(theme.totalCorrect / theme.tasks.length);
    totalCorrect += theme.totalCorrect;
    $('.theme-scores').append( $percentage, $label, $newThemeBar);
  });

//***   BUILD TOTAL BAR   ***//
  
  $('.total-bar').append($('<svg class="svg-progress-bar" viewBox="0 0 100 100">'
      + ' <g><path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
      + ' <path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
      + ' <text class="percent-completed" text-anchor="middle" x="50%" y="55%">0%</text></g></svg>'));
  
//***   GET TOTAL FILL VALUE   ***//
  
  var len = $('.total-bar path:nth-child(2)')[0].getTotalLength(),
      totalFactor = totalCorrect ? totalCorrect / store.stats.numTasks : 0,
      totalFill = len - (len * totalFactor);

  $('.total-bar path:nth-child(2)').css(
    {'stroke-dasharray': len + ',' + len, 'stroke-dashoffset': len}
  );
  
//***   ANIMATE BARS   ***//

  var trackProgress = function($el, f, el, c) { $el.text( Math.floor(f * c * 100) + '%'); };
  
  $('.theme-scores .svg-progress-bar path:nth-child(2)').each( function(i, el)
  {
    $(this).velocity({ 'stroke-dashoffset': (100 - themeFills[i] * 100) },
      {
        duration: 1000,
        delay: 100,
        progress: trackProgress.bind( null,
          $('.theme-scores .percent-completed').eq(i), themeFills[i]
        )
    });
  });
  
  $('.total-bar .svg-progress-bar path:nth-child(2)')
    .velocity({ 'stroke-dashoffset': totalFill },
    {
      duration: 1000,
      delay: 1500,
      progress: trackProgress.bind( null,
        $('.total-bar .percent-completed'), totalFactor
      )
    });
}

ResultsUtility.prototype.initScorepage = function()
{
  $('.toggle-lang').click( function()
  {
    store.currentLang = store.currentLang > 0 ? 0 : 1;
    updateLanguage(store.currentLang, 'results');
    $('.time-result').text(' ' + store.timer.formatTime('l'));
    animateClick($(this));
  });
  
  buildAnswerKey();

  var $timeResult = $(
    '<h4><span class="time-result-heading">Time taken: </span>'
    + '<span class="time-result">&nbsp;' + store.timer.timeString + '</span></h4>');
  $timeResult.insertBefore('.theme-scores');
  
  handleProgressBars();
  
  updateLanguage(store.currentLang, 'results');
}
