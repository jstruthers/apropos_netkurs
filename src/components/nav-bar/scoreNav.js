(function() {

	var public = {};

	public.init = function(store) {
		$('#retryModal').on('hidden.bs.modal', function()
		{
		  if (store.reset) { init(); }
		});
		
		$('.btn-modal-retry').click( function()
		{
		  store.themes = null;
		  store.stats = null;
		  store.currentTheme = 0;
		  store.currentTask = 0;
		  store.addTaskLines = [];
		  store.reset = true;
		  $('#retryModal').modal('hide');
		});
	};

	return public;
})();