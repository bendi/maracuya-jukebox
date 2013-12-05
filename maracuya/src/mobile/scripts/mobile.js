define([
    'jquery',
    'jqm',
    'underscore',
    'config',
    'server',
    'mbusRouter',
    'common',
    'scanner'
  ],
  function($, jqm, _, config, server, router, common, scanner) {
	
  return {
	  
    init: function() {
      var mBus = router.useRoute('server');
      scanner.init(mBus);

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
	  
	  // JZ: Code responsible for qr code scanner
	  $(document).on('vclick', '#scan', function(e) {
		//alert("JZ: lets try");
        mBus.notify('scanConfigCode');
	  });
	  
	  mBus.addListener("codeScanned", function(code) {
		$('#connectUrl').val(code);
      });
	  
	  // JZ end;
      
      mBus.addListener("appReady", function(data) {
    	  $.mobile.loading('hide');

    	  $.mobile.changePage("#player", {
    		  
    	  });
      });
    }
  };
});