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

                server.init({
                    homeUrl: url,
                    pageSize: config('playlistPageSize')
                });
            });

            mBus.addListener("appReady", function(data) {
                $.mobile.loading('hide');

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
            });

            return mBus;
        }
    };
});