let store = {
  themes : null,
  // (array) of 'theme'             (object)
  //    'title'                     (string)
  //    'description'               (string)
  //    'totalCorrect'              (integer)
  //    'tasks' (array) of 'task'   (object)
  //        'type'                  (integer)
  //        'question'              (string)
  //        'isCompleted'           (bool)
  //        'answers'               (object)
  //          'id'                  (integer)
  //          'isSelected'          (bool) || (string) if task.type === 3
  //          'isCorrect'           (bool) || (string) if task.type === 3
  //          'pos'                 (integer)
  //          'text'                (string)
  stats: null, //                   (object)
  //    testTitle                   (string)
  //    passRequirement             (integer)
  //    numTasks                    (integer)
  //    completedTasks              (integer)
  currentTheme : 0,
  currentTask : 0,
  currentLang : 0,
  reset : false,
  //    Check for toggling test reset
  getCurTask: function() { return store.themes[store.currentTheme].tasks[store.currentTask]; },
  randomJSON : "file:///D:/Arbeid/HTML/SmartLearn/Kunnskapstest/js/JsonRandomTest.json",
  langJSON : "file:///D:/Arbeid/HTML/SmartLearn/Kunnskapstest/js/lang.json",
  saveTemplate : null,
  pages : [
    'modal/hintModal.html',
    'results/scorepage.html',
    'info-panel/info-panel.html',
    'theme-list/theme-list.html'
  ]
};

export default store
    