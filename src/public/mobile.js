define([
    'jquery',
    'jqm',
    'underscore',
    'config',
    'server',
    'mbusRouter',
    'common'
  ],
  function($, jqm, _, config, server, router, common) {
	
  return {
	  
    init: function() {
      var mBus = router.useRoute('server');
      
      $(document).on('vclick', '#connect', function(e) {
    	 var url = $('#connectUrl').val();
    	 mBus.notify('connect', url); 
      });
      
      $(document).on('vclick', '#pause', function(e) {
    	  mBus.notify('pause');
      });
      
      $(document).on('vclick', '#resume', function(e) {
    	  mBus.notify('resume');
      });
      
      mBus.addListener("connect", function(url) {
    	  $.get = _.wrap($.get, function(get) {
    		  var args = _.rest(arguments);
    		  args[0] = url + args[0];
    		  return get.apply(this, args);
    	  });

        currentModule = server.init({
          homeUrl: url,
          pageSize: config('playlistPageSize')
        });
      });
      
      mBus.addListener("appReady", function(data) {
    	  alert("i'm in!");
      });
    }
  };
});