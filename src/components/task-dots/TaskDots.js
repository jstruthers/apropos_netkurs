(function () {
  var public = {};

  public.add = function(tasks, goto)
  {
    var $taskMark = $('<div class="dot-group">'
      + '<button class="task-mark unfinished"></button>'
      + '<span class="connecting-line">'
      +   '<span class="fa fa-arrow-right"></span></span>'
      + '</div>');

    for (var i = 0; i < tasks; i += 1)
    {
      var $newMark = $taskMark.clone();
      
      $newMark.find('button').addClass('task-mark_' + i)
              .attr('data-taskNum', i)
              .attr('tabindex', 0)
              .click( function(e) {
                  goto( $(this).attr('data-taskNum') );
              });

      if (i === 0) { $newMark.children('button').addClass('selected'); }
      else if (i === tasks - 1) { $newMark.children('span').remove(); }

      $(".theme-list .mark-container").append( $newMark );
    }
  };

  return public;
})();


