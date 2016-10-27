$( document ).ready( function() {

/*******************************
  INFO PANEL
********************************/

    function infoPanel() {
      $(".info-panel .title").text(store.stats.testTitle);

      $(".info-panel .num-tasks").next().text(store.stats.numTasks);
      
        $('.info-panel .tasks-remaining').next().text(store.stats.completedTasks);

      $(".info-panel .pass-requirement").next().text(store.stats.passRequirement + " %");
    }

/*******************************
  MAIN NAV-BAR
********************************/

  function build(store, animateClick, gotoTask, timer, gotoScorepage, scoreNav, reset) {

    $('.nav-btn').click( function() { animateClick($(this)); });
  
    $('.nav-bar .btn-hint').click( function(event)
    {
      event.preventDefault();
      var $hintText = $('.hint-text'),
          maxWidth = $('.task-container').width() * 0.8;
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
      timer.stop();
      console.log
      gotoScorepage(scoreNav, reset);
    });
  }

      var pages = {
        main: [
          ['.right-panel .header .row',   './html/timer.html'],
          ['.left-bar',                   './html/theme.html'],
          ['.left-bar',                   './html/info-panel.html'],
          ['.right-panel',                './html/main-nav.html']
        ],
        result: [
          ['#random_test .row.no-gutter',  './html/scorepage.html'],
          ['#random_test .scorepage',  './html/score-nav.html'],
          ['.nav-bar',                     './html/key.html'],
          ['.nav-bar',                     './html/retry.html']
        ]                                
      };



      function asyncLoop(arr, func, endLoop) {
        var i = 0,
            loop = function() {
              $.ajax({
                url: arr[i][1],
                dataType: 'text',
                error: function(err) { console.log(err); },
                success: function(data) {
                  if ( i < arr.length - 1) { func(i, data); i += 1; loop(); }
                  else { func(i, data); endLoop(); }
                }
              });
            };
        loop();
      };

      function updateLanguage(langBlock)
      {
        for (var term in langBlock) { $(term).text(langBlock[term]); }
      };

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
      };

      function initUtilities()
      {
        store.timer = new timer.utility( store );

        task = new task.utility(
          store,
          check, match, radio,
          animateClick);

        result = new result.utility(
          store,
          asyncLoop,
          updateLanguage,
          animateClick,
          store.timer);
      }

      function buildMain()
      {
        taskDots.add(
          store.tasks.length,
          task.goto.bind(task));

        info.build( store );

        task.buildTasks();

        mainNav.build(
          store,
          animateClick,
          task.goto.bind(task),
          store.timer,
          result.goto.bind(result),
          scoreNav,
          initStore.bind();

        task.togglePopover($('.optText, .match-label'));
        
        updateLanguage(langData[store.currentLang].main);
        $('.toggle-lang').click( function()
        {
          store.currentLang = store.currentLang > 0 ? 0 : 1;
          updateLanguage(langData[store.currentLang].main);
          animateClick($(this));
        });
      };

      function initStore()
      {
        $('.loading-screen').velocity({
          opacity: 0
        }, { duration: 200, complete: function() { $('.loading-screen').hide() }});

        store.randomJSON = feed;
        store.langData = langData;
        store.pages = pages;

        store.stats = {
          testTitle: feed.testInfo,
          passRequirement: feed.PassRequirement,
          numTasks: feed.NoOfTasks,
          durationTime: feed.DurationTime,
          alertTime: feed.AlertTime,
          completedTasks: 0,
          totalCorrect: 0
        };

        store.tasks = feed.TestThemes[0].AThemes[0].Tasks.map( function( task )
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
        });

        if (!store.reset) { initUtilities(); }
        store.reset = false;

        this.buildMain();
      }

      asyncLoop(
        scripts,
        function(i, data) { scripts[i][0]] = window.eval(data); },
        function() { asyncLoop(
          pages['main'],
          function(i, data) { $(pages['main'][i][0]).append( $(data) ); },
          function() { initStore(); }
        );}
      );
});


