(function() {
  return {
    tasks : null,
    stats: null,
    currentTheme : 0,
    currentTask : 0,
    currentLang : 0,
    reset : false,
    getCurTask: function() { return store.tasks[store.currentTask]; },
    randomJSON : "file:///D:/Arbeid/HTML/SmartLearn/Kunnskapstest/js/JsonRandomTest.json"
  };
})();


