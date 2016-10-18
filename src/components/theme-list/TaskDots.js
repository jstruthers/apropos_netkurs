(function () {
  var public = {};
 /*
 * @function buildTaskRow
 * @desc Check
 * @param {object} info required to build row of .task-mark
          props:
            numTasks: {number} maximum number of tasks in one row,
            cellWidth: {number} width of .task-mark node,
            fullRow: itemsInRow
        specs.reverse = i % 2 === 1 ? true : false;
    specs.rowNum = i;
 */
  function buildTaskRow (specs)
  {
    var cW = specs.cellWidth, cH = cW - 15, tmW = cW - 30,

        $cell = $('<td></td>').css({width: cW, height: cH}),

        $taskMark = $('<button class="task-mark unfinished"></button>')
                      .css({ width: tmW, height: tmW }),

        $row = $('<tr></tr>');

    for (var i = 0; i < specs.numTasks; i += 1)
    {
      var $newCell = $cell.clone().attr('align', 'center')
                          .addClass('connected'),

          $newMark = $taskMark.clone(),

          taskNum = specs.fullRow * specs.rowNum + i;
      
      $newMark.addClass('task-mark_' + taskNum);

      $newMark.attr('data-taskNum', taskNum).attr('tabindex', 0);

      if (taskNum === 0) { $newMark.addClass('selected'); }

      $newMark.click(function(e) { gotoTask( $(this).attr('data-taskNum') ); });

      $newCell.append($newMark);

      $row.append($newCell);
    }

    return $row;
  }

  public.add = function(tasks)
  {
    var cellWidth = 50,

        itemsInRow = Math.floor( $('#left_bar').width() / cellWidth ),

        rows = Math.ceil(tasks / itemsInRow),

        remainder = tasks % itemsInRow,

        specs = {
          cellWidth: cellWidth,
          fullRow: itemsInRow
        };

    for (var i = 0; i < rows; i += 1)
    {
      remainder && (i === rows - 1)
        ? specs.numTasks = remainder
        : specs.numTasks = itemsInRow;
      
      $(".theme-list").append(buildTaskRow( specs ));
    }
  };

  return public;
})();


