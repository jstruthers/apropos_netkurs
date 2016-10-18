(function()
{
	var public = {};

	public.init = function(store) {
		$(".info-panel .title").text(store.stats.testTitle);

		$(".info-panel .num-tasks").next().text(store.stats.numTasks);
	  
	  	$('.info-panel .tasks-remaining').next().text(store.stats.completedTasks);

		$(".info-panel .pass-requirement").next().text(store.stats.passRequirement + " %");
	};

	return public;
})();


