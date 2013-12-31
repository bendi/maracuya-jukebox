define([
    'jquery',
    'jqm',
    'jqr',
    'editinplace',
    'underscore',
    'config',
    'eventHandler',
    'server',
    'stream',
    'mbusRouter',
    'common'
],
function($, jqm, jqr, editinplace, _, config, eventHandler, server, stream, router, common) {

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

            var mBus = router.useRoute(module);

            mBus.addListener('appReady', function(data) {
                eventHandler.init(data.paused);
            });

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
                $.get('/ping')
                    .done(function(data) {
                        var settings = {
                            text: data.ip
                        };
                        if (common.isIE()) {
                            settings.render = "table";
                        }
                        $('.qrCode').qrcode(settings);
                    });
            }
        }
    };
});
