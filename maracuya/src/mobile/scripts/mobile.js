define([
    'jquery',
    'jqm',
    'underscore',
    'config',
    'server',
    'mbusRouter',
    'common',
    'eventHandler',
    'scanner'
  ],
  function($, jqm, _, config, server, router, common, eventHandler, scanner) {
	
  return {
	  
    init: function() {
      var mBus = router.useRoute('server');
      scanner.init(mBus);
      eventHandler.init(mBus);
	  
	  _.defer(function() {
		mBus.notify('connect', 'http://localhost:8280'); 
	  });
      
      var connectUrl;
      mBus.addListener("connect", function(url) {
    	  $.mobile.loading('show', {
    		  text: "connecting",
    		  textVisible: true
    	  });
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
    	  $.mobile.loading('hide');

    	  $.mobile.changePage("#player", {
    		  
    	  });
      });
    }
  };
});