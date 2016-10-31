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
    return $('.task_' + this.taskId);
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
    var $task = $( '<div class="task task_' + this.taskId + ' ' + this.type + '">'),
        $row = $('<div></div>'),
        $header = $(  '<div class="col-xs-12">'
                    + '<h4 class="question">'
                    + this.storeTask.question + '</h4>'
                    + '</div>'),
        $body = $(  '<div class="col-xs-10 col-xs-offset-1">'
                  + '<div class="body"><div class="row">'
                  + '<div class="options col-xs-12 col-lg-7"></div>'
                  + '<img class="task-image col-xs-12 col-lg-5" src="http://placehold.it/750x450" />'
                  + '</div></div></div>');
    
    $task.append( $row.append( $header, $body ) );
    
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

  Checkbox.prototype = new MultiChoice;

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

  Radio.prototype = new MultiChoice;

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
  TASK: MATCH
*************************************************************************************************************************/

////  TAB OBJECT
////------------
  function Tab (config)
  {
    this.info = config.info;
    this.id = config.id;
    this.$task = $('.task-container');
    this.$row = config.$task.find('.match-label').eq(this.id);
    this.$popover = config.$popover;
    this.match = config.match;
    this.$el = $('<div class="match-tab tab' + config.id + '"></div>');
    this.$line = $('<svg class="line line' + config.id
      + '" width="' + this.$task.width()
      + '" height="' + (this.$task.height() - 3)
      + '" viewPort="0 0 ' + this.$task.width() + ' ' + this.$task.height()
      + '" xmlns="http://www.w3.org/2000/svg">'
      + '<line x1="0" y1="0" x2="0" y2="0"'
      + ' stroke-width="5" stroke="#555"'
      + ' stroke-linecap="round"'
      + ' shape-rendering="optimizeQuality"/>'
      + '</svg>');
  };

  /***   CHANGE POSITION   ***/

  Tab.prototype.setOrigin = function()
  {
    this.origin = {
      x: this.$row.offset().left + this.$row.width() - this.$task.offset().left + 23,
      y: this.$row.offset().top - this.$task.offset().top + 5
    };
    this.$line.find('line')
      .attr('x1', this.origin.x + this.$el.width() / 2)
      .attr('y1', this.origin.y + this.$el.height() / 2);
    this.$popover.css({
      left: this.$row.offset().left - this.$task.offset().left,
      top: this.$row.offset().top - this.$task.offset().top,
      width: this.$row.width() + 20,
      height: this.$row.parent().height()
    });
  }

  Tab.prototype.moveLine = function(x2, y2)
  {
    this.$line.find('line')
      .attr('x2', x2 + this.size.w / 2)
      .attr('y2', y2 + this.size.h / 2);
  };

  Tab.prototype.move = function(x, y)
  {
    this.$el.css({ left: x, top: y });
    this.match.getDims(this);
    this.moveLine(x, y);
  };

  Tab.prototype.handleSlotResize = function(slot)
  {
    slot.$popover.css({
      left: slot.$row.offset().left - this.$task.offset().left,
      top: slot.$row.offset().top - this.$task.offset().top,
      width: slot.$row.width() + 20,
      height: slot.$row.parent().height()
    });
    this.match.getDims(slot);
  };

  Tab.prototype.handleResize = function()
  {
    var self = this;
    this.setOrigin();
    this.$line.attr('viewPort',
      '0 0 ' + this.$task.width() + ' ' + (this.$task.height() - 3));
    this.$line
      .attr('width', this.$task.width())
      .attr('height', this.$task.height());
    this.move( this.origin.x, this.origin.y );
    this.match.slots.forEach( self.handleSlotResize.bind(self));
  }

  /***   ANIMATE   ***/

  Tab.prototype.raiseEl = function()
  {
    this.$el.addClass('grab').velocity({
      scale: 1.2,
      boxShadowY:'5px'
    }, {
      duration: 100
    });   
  };

  Tab.prototype.lowerEl = function()
  { 
    this.$el.velocity({
      scale: 1,
      boxShadowY: 0
    }, {
      duration: 100
    }).removeClass('grab');
  };

  Tab.prototype.highlight = function($slot, color)
  {
    $slot.next().velocity({ borderLeftColor: color }, { duration: 100 });
  }

  Tab.prototype.springBack = function(self)
  { 
    this.$el.velocity({
      left: self.origin.x + 'px',
      top: self.origin.y + 'px',
    }, {
      duration: 1000,
      easing: [150, 15],
      progress: function(e) {
        var x2 = parseFloat($(e).css('left')),
            y2 = parseFloat($(e).css('top'));
        self.moveLine(x2, y2);
      },
      complete: function() { self.match.getDims(self); }
    });
  };

  /***   EVENT HANDLERS   ***/

  Tab.prototype.handleMousedown = function(self, e)
  {
    if ( e.pageY >= this.bounds[0] && e.pageX <= this.bounds[1]
      && e.pageY <= this.bounds[2] && e.pageX >= this.bounds[3])
    {
      this.draggable = true;
      this.grabbed = { x: e.pageX - this.pos.x, y: e.pageY - this.pos.y };
      $('.match-popover').css('z-index', -1);
      $('.match-tab').css('z-index', 1);
      $('.match-tab + .line').css('z-index', 0);
      this.$el.next('.line').css('z-index', 2);
      this.$el.css('zIndex', 3).off('mouseover mouseout').removeClass('grab').addClass('grabbing');
      this.$task.find('*').addClass('unselectable').attr('unselectable', 'on');
      this.$task.mousemove( self.handleMousemove.bind(self) );
    }
  };

  Tab.prototype.handleMousemove = function(e)
  {
    this.move(
      e.pageX - this.grabbed.x - this.$task.offset().left,
      e.pageY - this.grabbed.y - this.$task.offset().top);
    this.checkCovering();
  };

  Tab.prototype.handleMouseup = function(self)
  {
    var self = this;
    this.draggable = false;
    if ( this.covering )
    {
      this.covering.$el.attr('data-covered', self.id);
      this.move(
        this.covering.bounds[3] - this.$task.offset().left + 5,
        this.covering.bounds[0] - this.$task.offset().top + 5
      );
      self.highlight(this.covering.$el, '#5F9EA0');
    }
    else { this.springBack(this); }
    checkCompleted(this.id, this.match.storeTask, [this.covering.text, this.covering.id]);
    
    this.$task.find('*').removeClass('unselectable').removeAttr('unselectable' );
    this.$task.off('mousemove');
    $('.match-popover').css('z-index', 10);
    $('.match-tab').css('z-index', 2);
    $('.match-line').css('z-index', 1);
    this.$el.next('.line').css('z-index', 1);
    
    this.$el.removeClass('grabbing').addClass('grab')
      .mouseover( self.raiseEl.bind(self) ).mouseout( self.lowerEl.bind(self) );
  };

  Tab.prototype.bindHandlers = function()
  {
    var self = this;
    this.$el.mouseover( self.raiseEl.bind(self) )
      .mouseout( self.lowerEl.bind(self) )
      .mousedown( self.handleMousedown.bind(self, self) )
      .mouseup( self.handleMouseup.bind(self, self) );
    $( window ).resize( self.handleResize.bind(self) );
  }

  /***   CHECK IF TAB COVERS SLOT   ***/

  Tab.prototype.checkCovering = function()
  {
    var self = this,
        overlap = function(tB, sB) {
          return ( tB[3] < sB[1] && tB[1] > sB[3] && tB[0] < sB[2] && tB[2] > sB[0]);};

    this.match.slots.forEach( function( slot, i )
    {
      var covered = slot.$el.attr('data-covered');

      if (overlap( self.bounds, slot.bounds ))
      {
        if ( !covered )
          { if (!self.covering) {
            self.covering = slot;
            self.highlight(slot.$el, '#00FFFF');
          }}
        else
          { if (self.covering) {
            self.covering = false;
            self.highlight(slot.$el, '#5F9EA0');
          }}
      }
      else {
        if ( !self.match.tabs.some( function(tab) { return tab.covering.id === parseInt(covered) }))
          { slot.$el.removeAttr( 'data-covered'); }
        if ( slot.id === self.covering.id )
          { self.covering = false; self.highlight(slot.$el, '#5F9EA0'); }
      }
    });
  };

  Tab.prototype.init = function()
  {
    this.setOrigin();
    this.$el.css({ left: this.origin.x, top: this.origin.y });
    this.bindHandlers();
    if (this.covering)
    {
      this.move(
          this.covering.bounds[3] - this.$task.offset().left + 5,
          this.covering.bounds[0] - this.$task.offset().top + 5)
    } else {
      this.move(this.origin.x, this.origin.y);
    }
  };

////  MATCH TASK OBJECT
////-------------------
  
  function Match( storeTask, taskId ) {
    this.taskId = taskId;
    this.storeTask = storeTask;
    this.answers = storeTask.answers.map( function( a, i ) { return {text: a.text, info: a, id: i} });
    this.slots = storeTask.answers.map( function( a ) { return {text: a.isCorrect} });
  }

  Match.prototype.getParent = function()
  {
    return $('.task_' + this.taskId);
  };

  /***   CALCULATE POSITION, WIDTH, HEIGHT, TOP, RIGHT, BOTTOM, LEFT OF SLOT AND TAB   ***/

  Match.prototype.getDims = function(obj)
  {
    var w = obj.$el.width(), h = obj.$el.height(),
        x = obj.$el.offset().left, y = obj.$el.offset().top;

    // Upper left corner
    obj.pos = {x: x, y: y};
    // w: width, h: height
    obj.size = {w: w, h: h};
    // Top, right, bottom, left
    obj.bounds = [y, x + w, y + h, x];
  };

  /*** CREATE ELEMENTS ***/

  Match.prototype.init = function()
  {
    var self = this,
        $task = $( '<div class="task task_' + this.taskId + '">'),
        $aContainer = $( '<div class="col-sm-6 col-xs-12">'
          + '<div class="answer-container"></div></div>'),
        $sContainer = $( '<div class="col-sm-5 col-xs-12">'
          + '<div class="slot-container"></div></div>'),
        $row = $('<div class="row"></div>'),
        $tile = $('<div class="col-xs-12"></div>'),
        $img = $('<img></img>'),
        $label = $('<p class="match-label"></p>'),
        $popover = $('<div class="match-popover"'
          + 'data-toggle="popover" data-placement="auto" data-trigger="hover" data-container="body"></div>'),
        $tabSlot = $('<div class="tab-slot"></div>'),
        $tab = $('<div class="match-tab"></div>');
    
    function makeTile(obj, type, id)
    {
      var $newLabel = $label.clone().text(obj.text).attr('data-id', id),
          $newPopover = $popover.clone().attr('data-content', obj.text).attr('data-id', id),
          $newImg = $img.clone(),
          $newTabSlot = $tabSlot.clone(),
          $newRow = $row.clone(),
          $newTile = type > 0
            ? $newRow.append( $newImg, $newLabel, $newTabSlot )
            : $newRow.append( $newTabSlot, $newLabel );
      obj.$popover = $newPopover;
      return $tile.clone().append( $newTile );
    }
    
    this.slots.forEach( function( slot, i )
    {
      $aContainer.find('.answer-container').append( makeTile( self.answers[i], 1, 'a_' + i));
      $sContainer.find('.slot-container').append( makeTile( slot, 0, 's_' + i));
    });

    $task.append(
      $('<div class="col-xs-12"></div>').append(
        $('<div class="match-container"></div>').append(
          $row.clone().append(
            $('<div class="col-xs-12"></div>').append(
              $('<h4>' + this.storeTask.question + '</h4>'))),
          $row.clone().append(
            $aContainer, $('<div class="col-sm-1 col-xs-0"></div>'), $sContainer))));
    
    return $task;
  };

  /***   CREATE SLOT AND TAB OBJECTS    ***/

  Match.prototype.componentsInit = function(self, $task)
  {
    this.tabs = this.slots.map( function( slot, i)
    {
      var a = self.answers[i],
          tab = new Tab({
            info: a.info, id: a.id, $task: $task,
            match: self.storeTask.obj, $popover: a.$popover
        });
      slot.id = i;
      slot.$el = self.getParent().find('.slot-container .tab-slot').eq(i);
      slot.$row = slot.$el.siblings('.match-label');
      tab.handleSlotResize(slot);
      $task.append(slot.$popover, a.$popover, tab.$el, tab.$line);
      
      return tab;
    });
    
    this.tabs.forEach( function(tab) {
      tab.covering = tab.info.isSelected
        ? self.slots[tab.info.isSelected[1]]
        : false;
      tab.init();
    });
  };

/************************************************************************************************************************
  TASK: STANDARD
*************************************************************************************************************************/

  function Standard(storeTask, taskId)
  {
    this.storeTask = storeTask;
    this.taskId = taskId;
  }

  Standard.prototype.init = function()
  {
    console.log(this.storeTask)
    var $task = $( '<div class="task task_' + this.taskId + '">'),
        $wrapper = $('<div class="row standard"><div class="col-xs-12"></div></div>'),
        $header = $wrapper.clone().append(
          $('<h4 class="title">' + this.storeTask.options[0].title + '</h4>')),
        $img = $wrapper.clone().append(
          $('<img src="http://placehold.it/750x450" />')),
        $text = $wrapper.clone().append(
          $('<p>' + this.storeTask.options[0].text + '</p>'));

    return $task.append($header, $img, $text);
  };

/************************************************************************************************************************
  TASK: EXPLORE
*************************************************************************************************************************/

  function Explore(storeTask, taskId)
  {
    this.storeTask = storeTask;
    this.taskId = taskId;
  }

  Explore.prototype.buildHotSpot = function()
  {
    var $els = this.storeTask.map( function(item) {
      return item.map( function(hotspot) {
        return $('<div class="hotspot">' + hotspot.text + '</div>')
                    .css({
                      'left': hotspot.pos.x + 'px',
                      'top': hotspot.pos.y + 'px'
                    });
      });
    });

    return [].concat.apply([], $els);
    // on mouse over hightlight
    // onclick or mouseover display tooltip
  };

  Explore.prototype.handleClick = function()
  {
    // maybe, maybe not
  };

  Explore.prototype.init = function()
  {
    console.log(this.storeTask);
    var $task = $( '<div class="task task_' + this.taskId + '">'),
        $wrapper = $('<div class="row explore"><div class="col-xs-12"></div></div>'),
        $header = $wrapper.clone().append(
          $('<h4 class="title">' + this.storeTask.options[0].title + '</h4>')),
        $img = $wrapper.clone().append(
          $('<img src="http://placehold.it/750x450" />')),
        $text = $wrapper.clone().append(
          $('<div>' + this.storeTask.options[0].text + '</div>'));

    return $task.append($header, $img, $text);
  };

/************************************************************************************************************************
  TASK: SLIDESHOW
*************************************************************************************************************************/

  function Slideshow(storeTask, taskId)
  {
    this.storeTask = storeTask;
    this.taskId = taskId;
  }

  Slideshow.prototype.init = function()
  {
    console.log(this.storeTask);
    var $task = $( '<div class="task task_' + this.taskId + '">'),
        $wrapper = $('<div class="row slideshow"><div class="col-xs-12"></div></div>'),
        $header = $wrapper.clone().append(
          $('<h4 class="title">' + this.storeTask.options[0].title + '</h4>')),
        $img = $wrapper.clone().append(
          $('<img src="http://placehold.it/750x450" />'));

    return $task.append($header, $img);
  };

/************************************************************************************************************************
  TASK: SORTING
*************************************************************************************************************************/

  function Sorting(storeTask, taskId)
  {
    this.storeTask = storeTask;
    this.taskId = taskId;
  }

  Sorting.prototype.init = function()
  {
    console.log(this.storeTask);
    var $task = $( '<div class="task task_' + this.taskId + '">'),
        $row = $('<div></div>'),
        $header = $(  '<div class="col-xs-12">'
                    + '<h4 class="question">'
                    + this.storeTask.question + '</h4>'
                    + '</div>'),
        $body = $(  '<div class="col-xs-10 col-xs-offset-1">'
                  + '<div class="body"><div class="row">'
                  + '<div class="options col-xs-12 col-lg-7"></div>'
                  + '<img class="task-image col-xs-12 col-lg-5" src="http://placehold.it/750x450" />'
                  + '</div></div></div>');
    return $task.append($row.append($header, $body));
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
      $('.timer').text( '00:00' );
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
  build: {
    randomTest: {
      page: './html/randomTest.html',
      json: [
        ['jsonRandomTest', './json/JsonRandomTest.json'],
        ['langData', './json/langData.json']
      ]
    }
  }
},

/************************************************************************************************************************
UTILITY FUNCTIONS
*************************************************************************************************************************/

asyncLoop = function(arr, func, endLoop) {
  console.log(arr, store.build.randomTest)
  var i = 0,
      loop = function() {
        $.ajax({
          url: arr[i][1],
          dataType: 'text',
          error: function(err) { console.log(err.responseText); },
          success: function(data) {
            if ( i < arr.length - 1) { func(i, data); i += 1; loop(); }
            else { func(i, data); console.log('ending loop'); endLoop(); }
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
    store.timer.stop();
    gotoScorepage();
  });
},

/************************************************************************************************************************
  APPEND SCORE NAV-BAR EVENT LISTENERS
*************************************************************************************************************************/

scoreNav = function() {

  $('#retryModal').on('hidden.bs.modal', function()
  {
    if (store.reset) {
      $('#random_test').html("");
      $.ajax({
        url: store.pages['randomTest'],
        dataType: 'text',
        error: function(err) { console.log(err.responseText); },
        success: function(i, data) {
          $('.main-content').append( $(data) );
          initStore('randomTest');
        }
      });
    }
  });
  
  $('.btn-modal-retry').click( function()
  {
    store.tasks = null;
    store.stats = null;
    store.currentTask = 0;
    store.totalCorrect = 0;
    store.reset = true;
    $('#retryModal').modal('hide');
  });
},

/************************************************************************************************************************
  APPEND TASK MALER NAV-BAR EVENT LISTENERS
*************************************************************************************************************************/

taskMalerNav = function()
{
  $('.nav-btn').click( function() { animateClick($(this)); });

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
},

/************************************************************************************************************************
  RESULTS UTILITY
*************************************************************************************************************************/

gotoScorepage = function()
{
  $("#random_test .row.no-gutter").html("");
  $.ajax({
        url: store.pages['scorepage'],
        dataType: 'text',
        error: function(err) { console.log(err.responseText); },
        success: function(i, data) {
          $('.main-content').append( $(data) );
          initScorepage();
          scoreNav(); 
        }
      });
},

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
            $('<div class="row"></div>').append(
                $answer, $correct )));
    $('#answerModal .modal-body').append(
        $('<div class="row"></div>').append( $qHeader, $qBody ));
                
  });
},

handleTotalBar = function()
{

//***   BUILD TOTAL BAR   ***//
  
  $('.total-bar').append($('<svg class="svg-progress-bar" viewBox="0 0 100 100">'
      + ' <g><path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
      + ' <path d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"></path>'
      + ' <text class="percent-completed" text-anchor="middle" x="50%" y="55%">0%</text></g></svg>'));
  
//***   GET TOTAL FILL VALUE   ***//

  var len = $('.total-bar path:nth-child(2)')[0].getTotalLength(),
      totalFactor = store.totalCorrect ? store.totalCorrect / store.stats.numTasks : 0,
      totalFill = len - (len * totalFactor);

  $('.total-bar path:nth-child(2)').css(
    {'stroke-dasharray': len + ',' + len, 'stroke-dashoffset': len}
  );
  
//***   ANIMATE BARS   ***//

  var trackProgress = function($el, f, el, c) { $el.text( Math.floor(f * c * 100) + '%'); };
  
  $('.total-bar path:nth-child(2)')
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

  $('.task-stats').append($timeResult);
  
  handleTotalBar();
  
  updateLanguage(store.langData[store.currentLang].results);
  $('.toggle-lang').remove('click');
  $('.toggle-lang').click( function()
  {
    store.currentLang = store.currentLang === 'english' ? 'norwegian' : 'english';
  
    updateLanguage(store.langData[store.currentLang].results);
    $('.time-result').text(' ' + store.timer.formatTime('l'));
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
createTask = function (taskNum)
{
  var task = store.tasks[taskNum];

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
  }

  var $task = task.obj.init();

  /***   RAISE FIRST TASK TO TOP   ***/
  if ( taskNum === 0 ) { $task.css('z-index', 0) }
  $('.task-container').append( $task );
  if ( task.type === 3 ) {
    task.obj.componentsInit(task.obj, task.obj.getParent());
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
appendTasks = function()
{ 
  $('.task').remove();

  for (var i = store.tasks.length - 1; i >= 0; i -= 1)
  {
    createTask(i, this);
  }

  $( window ).resize( function()
  {
    togglePopover($('.optText, .match-label'));
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
gotoTask = function( nextTaskNum )
{
  var nextTaskNum = parseInt(nextTaskNum),
      totalTasks = store.tasks.length - 1,

      dir = (nextTaskNum - store.currentTask) > 0 ? 1 : -1,
      offset = ( $('.task-container').width() / 2 ) * dir + 'px',

      $prev = $('.task_' + store.currentTask),
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

  if (typeof handleBounds(nextTaskNum, totalTasks) === 'number')
  {
    store.currentTask = handleBounds(nextTaskNum, totalTasks);
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

    store.currentTask = nextTaskNum;
    $('.task .custom-btn').attr('tabindex', -1);
    $target.find('.custom-btn').attr('tabindex', 0);
    $('.task-mark.selected').removeClass('selected');
    $('.task-mark_' + nextTaskNum ).addClass('selected');
  }

  $disable.prop('disabled', true);
  setTimeout(function() { $disable.prop('disabled', false); }, 500 );
},

addTaskDots = function()
{
  var $taskMark = $('<div class="dot-group">'
    + '<button class="task-mark unfinished"></button>'
    + '<div class="fa fa-long-arrow-right"></div>'
    + '</div>');

  for (var i = 0; i < store.tasks.length; i += 1)
  {
    var $newMark = $taskMark.clone();
    
    $newMark.find('button').addClass('task-mark_' + i)
            .attr('data-taskNum', i)
            .attr('tabindex', 0)
            .click( function(e) {
                gotoTask( $(this).attr('data-taskNum') );
            });

    if (i === 0) { $newMark.children('button').addClass('selected'); }
    else if (i === store.tasks.length - 1) { $newMark.children('.fa').remove(); }

    $(".theme-list .mark-container").append( $newMark );
  }
};

/************************************************************************************************************************
  $ DOCUMENT READY
*************************************************************************************************************************/

$('document').ready( function() {

/************************************************************************************************************************
  BUILD RANDOM TEST
*************************************************************************************************************************/

  var buildRandomTest = function()
  {
    addTaskDots();

    infoPanel();

    appendTasks();

    randomTestNav();

    togglePopover($('.optText, .match-label'));
    
    updateLanguage(store.langData[store.currentLang].randomTest);
    $('.toggle-lang').click( function()
    {
      store.currentLang = store.currentLang === 'english' ? 'norwegian' : 'english';
      updateLanguage(store.langData[store.currentLang].randomTest);
      console.log(store.langData[store.currentLang])
      animateClick($(this));
    });

    store.timer = new Timer();
    store.timer.start();
  },

  buildTaskMaler = function()
  {
    addTaskDots();

    appendTasks();

    taskMalerNav();
// add in hotSpot popover
    togglePopover($('.optText, .match-label'));

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
    $('.loading-screen').velocity({
      opacity: 0
    }, { duration: 200, complete: function() { $('.loading-screen').hide() }});

    if (!store.$testPage) { store.$testPage = $("#random_test .row.no-gutter").html(); }

    store.stats = {
      testTitle: store.jsonRandomTest.testInfo,
      passRequirement: store.jsonRandomTest.PassRequirement,
      numTasks: store.jsonRandomTest.NoOfTasks,
      durationTime: store.jsonRandomTest.DurationTime,
      alertTime: store.jsonRandomTest.AlertTime,
      completedTasks: 0,
      totalCorrect: 0
    };

    store.tasks = store.jsonRandomTest.TestThemes[0].AThemes[0].Tasks.map( function( task )
    {
      switch (buildOrder) {
        case 'randomTest':
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
          }
        case 'taskMaler':
          return {
            id: task.task_id,
            type: task.Questions[0].qt_id,
            hint: task.task_hint,
            isCompleted: false,
            options: task.Questions.map( function(q) {
              return {
                title: q.q_title,
                text: q.q_text,
                attachments: q.Attachments
              }
            })
          }
      };
    });

    store.reset = false;

    if (buildOrder === 'randomTest') { buildRandomTest(); }
    else { buildTaskMaler(); }
  };

  /************************************************************************************************************************
    INITIATE RANDOM TEST
  *************************************************************************************************************************/

  asyncLoop(
    store.build.randomTest.json,
    function(i, data) { store[store.build.randomTest.json[i][0]] = JSON.parse(data); },
    function() {
      $('.main-content').load(store.build.randomTest.page, initStore.bind(null, 'randomTest'));
    }
  );

  /************************************************************************************************************************
    INITIATE TASK MÅLER
  *************************************************************************************************************************/
//   var taskMalerJson = [
//     ["randomTest", "./json/JsonTaskMaler.json"],
//     ["langData", "./json/langData.json"]
//   ];
//   jsonLoop(
//     taskMalerJson,
//     function(i, data) { store[taskMalerJson[i][0]] = JSON.parse(data); },
//     function() {
//       asyncLoop(
//         store.pages['taskMaler'],
//         function(i, data) { $(store.pages['taskMaler'][i][0]).append( $(data) ); },
//         function() { initStore('taskMaler'); }
//       );
//     }
//   );
  
});


