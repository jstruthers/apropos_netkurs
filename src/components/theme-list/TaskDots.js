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
        console.log(specs);

    for (var i = 0; i < specs.numTasks; i += 1)
    {
      var $newCell = $cell.clone().attr('align', 'center'),

          $newMark = $taskMark.clone(),

          taskNum = specs.fullRow * specs.rowNum + i;

      if (i < specs.numTasks - 1) { $newCell.addClass('connected'); }
      
      $newMark.addClass('task-mark_' + taskNum);

      $newMark.attr('data-taskNum', taskNum).attr('tabindex', 0);

      if (taskNum === 0) { $newMark.addClass('selected'); }

      $newMark.click(function(e) { specs.goto( $(this).attr('data-taskNum') ); });

      $newCell.append($newMark);

      $row.append($newCell);
    }

    return $row;
  }

  public.add = function(tasks, goto)
  {
    var cellWidth = 50,

        $table = $('<table class="task-table"></table>');

        itemsInRow = Math.floor( $('.left-bar').width() / cellWidth ),

        rows = Math.ceil(tasks / itemsInRow),

        remainder = tasks % itemsInRow,

        specs = {
          cellWidth: cellWidth,
          fullRow: itemsInRow,
          goto: goto
        };

    for (var i = 0; i < rows; i += 1)
    {
      remainder && (i === rows - 1)
        ? specs.numTasks = remainder
        : specs.numTasks = itemsInRow;
      specs.rowNum = i;


      
      $table.append(buildTaskRow( specs ));
    }
    $(".theme-list").append($table);
  };

  return public;
})();


