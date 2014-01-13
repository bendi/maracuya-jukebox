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

                $.mobile.changePage("#player", {
                });
            });

            mBus.addListener("connect_failed", function() {
                $.mobile.loading('hide');

                $.mobile.changePage( "#connectFailed", { role: "dialog" } );
            });

            return mBus;
        }
    };
});