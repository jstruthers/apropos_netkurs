(function () {
  var public = {};

  /*
    append negative z-index div as line that extends as long as the row
    only a problem with a none full row
  */

  public.add = function(tasks, goto)
  {
    var $markContainer = $('<div class="mark-container"></div>'),

        $taskMark = $('<button class="task-mark unfinished"></button>');

    for (var i = 0; i < tasks; i += 1)
    {
      var $newMark = $taskMark.clone()
      
      $newMark.addClass('task-mark_' + i)
              .attr('data-taskNum', i)
              .attr('tabindex', 0)
              .click( function(e) {
                  goto( $(this).attr('data-taskNum') );
              });

      if (i === 0) { $newMark.addClass('selected'); }

      $markContainer.append($newMark);
    }

    $(".theme-list").append($markContainer);
  };

  return public;
})();


