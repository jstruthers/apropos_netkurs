$( document ).ready( function() {

    // Module
    (function () {
      var public = {},
          // Private Properties
          loaded = 0,
          scripts = [
            ['feed',      './js/JsonRandomTest.js'],
            ['store',     './js/store.js'],
            ['langData',  './js/langData.js'],
            ['info',      './js/components/infoPanel.js'],
            ['timer',     './js/components/Timer.js'],
            ['task',      './js/components/TaskUtility.js'],
            ['taskDots',  './js/components/TaskDots.js'],
            ['result',    './js/components/ResultsUtility.js'],
            ['check',     './js/components/Checkbox.js'],
            ['radio',     './js/components/Radio.js'],
            ['match',     './js/components/Match.js'],
            ['mainNav',   './js/components/mainNav.js'],
            ['scoreNav',  './js/components/scoreNav.js']
          ];

      public.pages = {
        main: [
          ['.right-panel .header .row',   './html/timer.html'],
          ['.left-bar',                   './html/theme.html'],
          ['.left-bar',                   './html/info-panel.html'],
          ['.right-panel',                './html/main-nav.html']
        ],
        result: [
          ['#random_test .row.no-gutter',  './html/scorepage.html'],
          ['#random_test .row.no-gutter',  './html/score-nav.html'],
          ['.nav-bar',                     './html/key.html'],
          ['.nav-bar',                     './html/retry.html']
        ]                                
      };

      public.asyncLoop = function(arr, func, endLoop) {
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

      public.updateLanguage = function(langBlock)
      {
        for (var term in langBlock) { $(term).text(langBlock[term]); }
      };

      public.animateClick = function($el)
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

      public.buildMain = function()
      {
        public.store.timer = new public.timer.utility( public.store );

        public.task = new public.task.utility(
          public.store,
          public.check, public.match, public.radio,
          public.animateClick);

        public.result = new public.result.utility(
          public.store,
          public.asyncLoop,
          public.updateLanguage,
          public.animateClick,
          public.store.timer);

        public.taskDots.add(
          public.store.tasks.length,
          public.task.goto.bind(public.task));

        public.info.init( public.store );

        public.task.buildTasks();

        public.mainNav.init(
          public.store,
          public.animateClick,
          public.task.goto.bind(public.task),
          public.store.timer,
          public.result.goto.bind(public.result));

        public.task.togglePopover($('.optText, .match-label'));
        
        public.updateLanguage(public.langData[public.store.currentLang].main);
        $('.toggle-lang').click( function()
        {
          public.store.currentLang = public.store.currentLang > 0 ? 0 : 1;
          public.updateLanguage(public.langData[public.store.currentLang].main);
          public.animateClick($(this));
        });
      };

      public.initStore = function()
      {
        $('.loading-screen').velocity({
          opacity: 0
        }, { duration: 200, complete: function() { $('.loading-screen').hide() }});

        public.store.reset = false;
        public.store.randomJSON = public.feed;
        public.store.langData = public.langData;
        public.store.pages = public.pages;

        public.store.stats = {
          testTitle: public.feed.testInfo,
          passRequirement: public.feed.PassRequirement,
          numTasks: public.feed.NoOfTasks,
          durationTime: public.feed.DurationTime,
          alertTime: public.feed.AlertTime,
          completedTasks: 0,
          totalCorrect: 0
        };

        public.store.tasks = public.feed.TestThemes[0].AThemes[0].Tasks.map( function( task )
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

        this.buildMain();
      }

      public.asyncLoop(
        scripts,
        function(i, data) { public[scripts[i][0]] = eval(data); },
        function() { public.asyncLoop(
          public.pages['main'],
          function(i, data) { $(public.pages['main'][i][0]).append( $(data) ); },
          function() { public.initStore(); }
        );}
      );

      return public;
    })();
});


