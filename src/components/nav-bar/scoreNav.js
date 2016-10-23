(function() {

	var public = {};

	public.build = function(store, reset) {

		// btn-modal-cancel-retry

		$('#retryModal').on('hidden.bs.modal', function()
		{
			console.log('store in reset func', store)
		  if (store.reset) { reset(); }
		});
		
		$('.btn-modal-retry').click( function()
		{
		  console.log('before reset func', store)
		  store.tasks = null;
		  store.stats = null;
		  store.currentTask = 0;
		  store.addTaskLines = [];
		  store.reset = true;
		  $('#retryModal').modal('hide');
		});
	};

	return public;
})();