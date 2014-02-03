define([
    "jquery",
    "jqm",
    "underscore",
    "config",
    "server",
    "mbusRouter",
    "common",
    "eventHandler",
    "scanner"
],
function ($, jqm, _, config, server, router, common, eventHandler, scanner) {


    function connect(url) {
        $.mobile.loading("show", {
            text: "connecting",
            textVisible: true
        });

        $.get = _.wrap($.get, function (get) {
            var args = _.rest(arguments);
            args[0] = url + args[0];
            return get.apply(this, args);
        });

        server.init({
            homeUrl: url,
            pageSize: config("playlistPageSize")
        });
    }

    function appReady(data) {
        $.mobile.loading("hide");

        $.mobile.changePage("#player", {
            transition: "slide"
        });
    }

    function connectFailed() {
        $.mobile.loading("hide");

        $.mobile.changePage("#connectFailed", {
            role: "dialog"
        });
    }

    return {

        init: function () {
            var mBus = router.useRoute("server");
            scanner.init(mBus);
            eventHandler.init(mBus);

            mBus.addListener("connect", connect);
            mBus.addListener("appReady", appReady);
            mBus.addListener("connect_failed", connectFailed);

            return mBus;
        }
    };
});