module.exports = Match;

/***************************
  TAB OBJECT
***************************/
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

/***************************
  MATCH TASK OBJECT
***************************/
function Match ( storeTask, taskId )
{
  this.taskId = taskId;
  this.storeTask = storeTask;
  this.answers = storeTask.answers.map( function( a, i ) { return {text: a.text, info: a, id: i} });
  this.slots = storeTask.answers.map( function( a ) { return {text: a.isCorrect} });
}

Match.prototype.getParent = function()
{
  return $('.task' + this.taskId[0] + '_' + this.taskId[1]);
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
      $task = $( '<div class="task task' + this.taskId[0] + '_' + this.taskId[1] + '">'),
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
}
