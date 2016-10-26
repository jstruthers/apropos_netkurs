(function() {
	var public = {};

	public.task = function(storeTask, taskId, animateClick, checkCompleted) {
		this.storeTask = storeTask;
		this.taskId = taskId;
		this.animateClick = animateClick;
		this.checkCompleted = checkCompleted;
	};

	return public;
})();