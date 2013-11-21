define([
    'jquery',
    'jqm',
    'qr',
    'editinplace',
    'underscore',
    'config',
    'server',
    'stream',
    'mbusRouter',
    'common'
  ],
  function($, jqm, qr, editinplace, _, config, server, stream, router, common) {

  var MODULE_SERVER = 'server',
    MODULE_STREAM = 'stream';

  var currentModule;

  return {
    MODULE_SERVER: MODULE_SERVER,
    MODULE_STREAM: MODULE_STREAM,

    init: function(module) {
      if (currentModule) {
        currentModule.destroy();
      }

      if(common.isAndroid()) {
        $('.playlistContainer').css({overflow:'',height:'auto'});
      }

      router.useRoute(module);

      var starting = currentModule ? false : true;

      switch(module) {
      case MODULE_SERVER:
        currentModule = server.init({
          homeUrl: config('homeUrl'),
          pageSize: config('playlistPageSize')
        });
        break;
      case MODULE_STREAM:
        currentModule = stream.init();
        break;
      }

      if (starting) {
        var settings = {
          text: "This plugin is great!"
        };
        if (common.isIE()) {
          settings.render = "table";
        }
        $('.qrCode').qrcode(settings);
      }
    }
  };
});