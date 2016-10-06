export default class ThemeListUtility
{
  /*
   * @function buildTaskRow
   * @desc Check
   * @param {object} info required to build row of .task-mark
            props:
              numTasks: {number} maximum number of tasks in one row,
              cellWidth: {number} width of .task-mark node,
              fullRow: {number} maximum items in a row,
              themeNo: {number} current theme number
              reverse: {boolean} 
              rowNum: {number} current row iteration;
   */
  buildTaskRow({ reverse: r, cellWidth: cW, numTasks: nT, fullRow, themeNo, rowNum: nR})
  {
    var cH = cW - 15, tmW = cW - 30,
        $cell = $('<td></td>').css({width: cW, height: cH}),
        $taskMark = $('<button class="task-mark unfinished"></button>')
                      .css({ width: tmW, height: tmW }),
        $corner =  $('<div></div>').css({width: cW*0.75, height: cW/2}),
        $row = $('<tr></tr>'),
        loop = {};

    loop.i = r ? nT - 1 : 0;
    loop.check = r ? function() {return loop.i >= 0} : function() {return loop.i < nT};
    loop.inc = r ? function() {return loop.i--} : function() {return loop.i++};

    for (loop.i; loop.check(); loop.inc())
    {
      var $newCell = $cell.clone().attr('align', 'center')
                       .addClass('connected'),
          $newMark = $taskMark.clone(),
          taskNum = fullRow * nR + loop.i;
      
      $newMark.addClass('task-mark_' + taskNum + '_' + themeNo);
      $newMark.attr('data-taskNum', taskNum).attr('tabindex', 0);
      if (taskNum === 0) { $newMark.addClass('selected'); }

      $newMark.click(function(e) { gotoTask( $(this).attr('data-taskNum') ); });

      $newCell.append($newMark);
      $row.append($newCell);
    }

    if (specs.reverse) 
    {
      $corner.addClass('end-cell-left').css({top: tmW*0.6 + 'px', left: tmW + 'px'});
      $cell.clone().append($corner).insertBefore($row.find('td:first-child'));
    } else 
    {
      $corner.addClass('end-cell-right').css({top: tmW*0.6 + 'px', right: tmW*0.7 + 'px'});
      $row.append($cell.clone().append($corner));
    }

    return $row;
  }

  addTaskLine($section, themeNo)
  {
    var cellWidth = 50,
        theme = store.themes[themeNo],
        itemsInRow = Math.floor(
          $('#left_bar').width() / cellWidth ),
        rows = Math.ceil(theme.tasks.length / itemsInRow),
        remainder = theme.tasks.length % itemsInRow,
        specs = { cellWidth, fullRow, themeNo };

    for (var i = 0; i < rows; i += 1)
    {
      specs.reverse = i % 2 === 1 ? true : false;
      specs.rowNum = i;

      remainder && (i === rows - 1)
        ? specs.numTasks = remainder
        : specs.numTasks = itemsInRow;
      $section.find('.oppgaver').append( this.buildTaskRow( specs ));
    }
    
    $section.find('.oppgaver')
      .children(':last-child')
      .children(':last-child')
      .find('.end-cell-left, .end-cell-right')
      .remove();
  }

  themeTransition( themeNo )
  {
    this.buildTasksInTheme( themeNo );
    store.currentTheme = themeNo;
    tasks.togglePopover($('.optText, .match-label')).goto(0, true);
    $('.task-container')
      .velocity({ opacity: 0 }, { duration: 0 })
      .velocity('reverse', {delay: 100, duration: 300});
  }

  buildThemeSection()
  {
    let $sectionTemplate = store.templates.$themeList.clone()
                             .removeClass('section-template');
    $('.theme-list').empty();

    store.themes.forEach( (theme, index) => {
      let $newSection = $sectionTemplate.clone(), self;

      $newSection.find(".panel-title").text(store.themes[index].title);
      $newSection.find('.panel-heading').click(() => {
          $('.panel-collapse.in').collapse('toggle');
          $(this).siblings('.panel-collapse').collapse('toggle');
          this.themeTransition( index );
        });
      
      if (index === 0) {$newSection.find('.panel-collapse').addClass('in');}
      
      this.addTaskLine($newSection, index);
      
      $(".theme-list").append($newSection);
    });
  }
}
