$( document ).ready( function() {

    // Module
    var RandomTest = (function () {
      var public = {},
          // Private Properties
          loaded = 0,
          scripts = [
            ['feed', './js/JsonRandomTest.js'],
            ['store', './js/store.js'],
            ['langData', './js/langData.js'],
            ['info', './js/components/info-panel.js'],
            ['timer', './js/Timer.js'],
            ['task', './js/components/TaskUtility.js'],
            ['taskDots', './js/components/TaskDots.js'],
            ['result', './js/components/ResultsUtility.js'],
            ['check', './js/components/Checkbox.js'],
            ['radio', './js/components/Radio.js'],
            ['match', './js/components/Match.js'],
            ['mainNav', './js/components/main-nav.js'],
            ['scoreNav', './js/components/score-nav.js']
          ];

      public.pages = {
        main: [
          ['#left_bar', './html/theme.html'],
          ['#left_bar', './html/info-panel.html'],
          ['.right-panel', './html/main-nav.html'],
          ['.nav-bar', './html/hint.html']
        ],
        score: [
          ['#randomTest', './html/scorepage.html'],
          ['#randomTest', './html/score-nav.html'],
          ['.nav-bar', './html/key.html'],
          ['.nav-bar', './html/retry.html']
        ]                                
      };

      function getModule (prop, url) {
          $.ajax({
            url: url,
            success: function(data) { public[prop] = eval(data); loaded += 1;},
            error: function(err) { console.log(err); },
            dataType: "text"
          });
      }

      function getPages(group) {
        var i = 0,
            arr = public.pages[group],
            loop = function() {
              $.ajax({
                url: arr[i][1],
                success: function(data) {
                  loaded += 1;
                  if (i < arr.length - 1) {
                    $(arr[i][0]).append( $(data) );
                    i += 1;
                    loop();
                  }
                },
                error: function(err) { console.log(err); }
              });
            };
        loop();
      }

      scripts.forEach( function(el) { getModule( el[0], el[1] ); });
      getPages('main');

      $( document ).ajaxComplete(function() {
        if (loaded === (scripts.length + public.pages.main.length)) { initStore(); }
      });

      public.updateLanguage = function(langID, langBlock)
      {
        for (var term in this.langData[langID][langBlock])
        {
          $(term).text(this.langData[langID][langBlock][term]);
        }
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
      }

      function initStore()
      {
        public.store.reset = false;
        public.store.randomJSON = public.feed;

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

        buildMain();
      }

      function buildMain()
      {
        public.task = new public.task.utility(public.store, public.check, public.match, public.radio, animateClick);
        public.timer = new public.timer.utility( public.store.stats.durationTime, public.store.stats.alertTime );
        public.taskDots.add(public.store.tasks.length);
        public.task.buildTasksInTheme();
        public.mainNav.init(public.store, animateClick, public.task.goto.bind(public.task));
        public.task.togglePopover($('.optText, .match-label'));
        
        public.updateLanguage(public.store.currentLang, 'main');
        $('.toggle-lang').click( function()
        {
          store.currentLang = store.currentLang > 0 ? 0 : 1;
          self.updateLanguage(store.currentLang, 'main');
          self.animateClick($(this));
        });
      }

      return public;
    })();
});


