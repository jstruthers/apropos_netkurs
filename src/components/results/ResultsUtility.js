(function() {
  var public = {};

  public.utility = function(store, asyncLoop, updateLanguage, animateClick, timer) {
    this.store = store;
    this.asyncLoop = asyncLoop;
    this.updateLanguage = updateLanguage;
    this.animateClick = animateClick;
    this.timer = timer;
  }

  public.utility.prototype.goto = function()
  {
    $("#random_test .row").html("");

    this.asyncLoop(
      this.store.pages.result,
      function(i, data) { $(this.store.pages.result[i][0]).append( $(data) ); console.log($(this.store.pages.result[i][0])); }.bind(this),
      function() { this.initScorepage(); }.bind(this)
    );
  };

  public.utility.prototype.grade = function()
  {
    this.store.tasks.forEach(function(task) {
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
                  answer.isSelected = this.langData[this.currentLang].misc.matchIncomplete;
                }
                answer.markWrong = true; return false;
              }
            })
      } else { task.correct.push(false); }

      task.correct = task.correct.reduce( function( prev, curr ) { return prev && curr  }, true);

      if (task.correct) { this.totalCorrect += 1; }
    }.bind(this.store));
  };

  public.utility.prototype.buildAnswerKey = function()
  {
    var $keyWrapper = $('<div class="col-xs-12"></div>');
    
    this.grade();

    this.store.tasks.forEach( function( task )
    {
      var $qHeader = $keyWrapper.clone().append($(
                        '<div class="question">'
                        + '<p><span class="first-label">Task ID:</span> ' + task.id + '</p>'
                        + '<p><span class="second-label">Question:</span> ' + task.question + '</p>'
                        + '</div>')),

          getIcon = function(check)
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
              $('<div class="row"></div>').append(
                  $answer, $correct )));
      $('#answerModal .modal-body').append(
          $('<div class="row"></div>').append( $qHeader, $qBody ));
                  
    });
  }

  public.utility.prototype.handleTotalBar = function()
  {

  //***   BUILD TOTAL BAR   ***//
    
    $('.total-bar').append($('<svg class="svg-progress-bar" viewBox="0 0 100 100">'
        + ' <g><path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
        + ' <path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
        + ' <text class="percent-completed" text-anchor="middle" x="50%" y="55%">0%</text></g></svg>'));
    
  //***   GET TOTAL FILL VALUE   ***//

    var len = $('.total-bar path:nth-child(2)')[0].getTotalLength(),
        totalFactor = this.store.totalCorrect ? this.store.totalCorrect / this.store.stats.numTasks : 0,
        totalFill = len - (len * totalFactor);

        console.log();

    $('.total-bar path:nth-child(2)').css(
      {'stroke-dasharray': len + ',' + len, 'stroke-dashoffset': len}
    );
    
  //***   ANIMATE BARS   ***//

    var trackProgress = function($el, f, el, c) { console.log($el.siblings('path').css('stroke-dashoffset')); $el.text( Math.floor(f * c * 100) + '%'); };
    
    $('.total-bar')
      .velocity({ 'stroke-dashoffset': totalFill },
      {
        duration: 1000,
        delay: 1500,
        progress: trackProgress.bind( null,
          $('.total-bar .percent-completed'), totalFactor
        )
      });
  }

  public.utility.prototype.initScorepage = function()
  {
    var self = this;
    
    this.buildAnswerKey();

    var $timeResult = $(
      '<h4><span class="time-result-heading">Time taken: </span>'
      + '<span class="time-result">&nbsp;' + this.timer.timeString + '</span></h4>');
    $timeResult.insertBefore('.theme-scores');
    
    this.handleTotalBar();
    
    this.updateLanguage(this.store.langData[this.store.currentLang].results);
    $('.toggle-lang').click( function()
    {
      self.store.currentLang = self.store.currentLang > 0 ? 0 : 1;
      this.updateLanguage(this.store.langData[this.store.currentLang].results);
      $('.time-result').text(' ' + self.store.timer.formatTime('l'));
      self.animateClick($(this));
    });
  }

  return public;
})();