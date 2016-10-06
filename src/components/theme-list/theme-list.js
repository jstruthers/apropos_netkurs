 /*
 * @function buildTaskRow
 * @desc Check
 * @param {object} info required to build row of .task-mark
          props:
            numTasks: {number} maximum number of tasks in one row,
            cellWidth: {number} width of .task-mark node,
            fullRow: itemsInRow,
        themeNo: currentThemeNumber
        specs.reverse = i % 2 === 1 ? true : false;
    specs.rowNum = i;
 */
function buildTaskRow(specs)
{
  var r = specs.reverse,
      cW = specs.cellWidth, cH = cW - 15, tmW = cW - 30,
      $cell = $('<td></td>').css({width: cW, height: cH}),
      $taskMark = $('<button class="task-mark unfinished"></button>')
                    .css({ width: tmW, height: tmW }),
      $corner =  $('<div></div>').css({width: cW*0.75, height: cW/2}),
      $row = $('<tr></tr>'),
      loop = {};

  loop.i = r ? specs.numTasks - 1 : 0;
  loop.check = r ? function() {return loop.i >= 0} : function() {return loop.i < specs.numTasks};
  loop.inc = r ? function() {return loop.i--} : function() {return loop.i++};

  for (loop.i; loop.check(); loop.inc())
  {
    var $newCell = $cell.clone().attr('align', 'center')
                     .addClass('connected'),
        $newMark = $taskMark.clone(),
        taskNum = specs.fullRow * specs.rowNum + loop.i;
    
    $newMark.addClass('task-mark_' + taskNum + '_' + specs.themeNo);
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

function addTaskLine($section, currentThemeNumber)
{
  var cellWidth = 50,
      theme = store.themes[currentThemeNumber],
      itemsInRow = Math.floor(
        $('#left_bar').width() / cellWidth ),
      rows = Math.ceil(theme.tasks.length / itemsInRow),
      remainder = theme.tasks.length % itemsInRow,
      specs = {
        cellWidth: cellWidth,
        fullRow: itemsInRow,
        themeNo: currentThemeNumber
      };

  for (var i = 0; i < rows; i += 1)
  {
    specs.reverse = i % 2 === 1 ? true : false;
    specs.rowNum = i;

    remainder && (i === rows - 1)
      ? specs.numTasks = remainder
      : specs.numTasks = itemsInRow;
    $section.find('.oppgaver').append(buildTaskRow( specs ));
  }
  
  $section.find('.oppgaver')
    .children(':last-child')
    .children(':last-child')
    .find('.end-cell-left, .end-cell-right')
    .remove();
}

function themeTransition( themeNum )
{
  buildTasksInTheme( themeNum );
  store.currentTheme = themeNum;
  togglePopover($('.optText, .match-label'));
  gotoTask(0, true);
  $('.task-container')
    .velocity({ opacity: 0 }, { duration: 0 })
    .velocity('reverse', {delay: 100, duration: 300});
}

function buildThemeSection()
{
	var $sectionTemplate = $(".theme-list .section-template").clone()
                           .removeClass('section-template');
	$('.theme-list').empty();

	store.themes.forEach( function( theme, index )
  {
		var $newSection = $sectionTemplate.clone();

		$newSection.find(".panel-title").text(store.themes[index].title);
    $newSection.find('.panel-heading').click( function() {
        $('.panel-collapse.in').collapse('toggle');
        $(this).siblings('.panel-collapse').collapse('toggle');
        themeTransition( index );
      });
    
    if (index === 0) {$newSection.find('.panel-collapse').addClass('in');}
    
    addTaskLine($newSection, index);
    
		$(".theme-list").append($newSection);
	});
}


