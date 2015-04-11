import $ from "jquery";
import jqr from "jqr";
import jqm from "jqm";
import editinplace from "editinplace";
import _ from "underscore";
import {init as configInit} from "es6!config";
import config from "es6!config";
import eventHandler from "es6!eventHandler";
import server from "es6!server";
import stream from "es6!stream";
import router from "es6!mbusRouter";
import {isAndroid, isIE} from "es6!common";


const MODULE_SERVER = "server",
    MODULE_STREAM = "stream";

var currentModule;

return {
    MODULE_SERVER: MODULE_SERVER,
    MODULE_STREAM: MODULE_STREAM,

    init: function (module, homeUrl) {
        configInit(homeUrl);

        if (currentModule) {
            currentModule.destroy();
        }

        if (isAndroid()) {
            $(".playlistContainer").css({overflow: "", height: "auto"});
        }

        var mBus = router.useRoute(module);

        mBus.addListener("appReady", function (data) {
            eventHandler.init(data.paused);
        });

        var starting = currentModule ? false : true;

        switch (module) {
        case MODULE_SERVER:
            currentModule = server.init({
                homeUrl: config("homeUrl"),
                pageSize: config("playlistPageSize")
            });
            break;
        case MODULE_STREAM:
            currentModule = stream.init();
            break;
        }

        if (starting) {
            $.get("/ping")
                .done(function (data) {
                    var settings = {
                        text: "http://" + data.ips.join(":" + data.port + ", http://") + ":" + data.port
                    };
                    if (isIE()) {
                        settings.render = "table";
                    }
                    $(".qrCode").qrcode(settings);
                });
        }
    }
};
