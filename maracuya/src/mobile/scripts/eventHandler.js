define([
    "jquery",
    "jqm",
    "underscore"
],
function ($, jqm, _) {

    function checkIp(ips, fn) {
        if (!ips.length) {
            return fn("No valid ip found");
        }
        var ip = ips.pop();
        $.ajax({
                url: ip + "/ping",
                timeout: 500
            })
            .done(function () {
                fn(null, ip);
            })
            .fail(function () {
                checkIp(ips, fn);
            });
    }

    return {

        init: function (mBus) {
            $(document).on("vclick", "#connect", function (e) {
                var url = $("#connectUrl").val();
                mBus.notify("connect", url);
            });

            // JZ: Code responsible for qr code scanner
            $(document).on("vclick", "#scan", function (e) {
                //alert("JZ: lets try");
                mBus.notify("scanConfigCode");
            });

            mBus.addListener("codeScanned", function (code) {
                var ips = code.split(",");
                checkIp(ips, function (e, ip) {
                    if (e) {
                        alert(e);
                    } else {
                        $("#connectUrl").val(ip);
                    }
                });
            });
            // JZ end;

            $(document).on("vclick", "#pause", function (e) {
                mBus.notify("pause");
            });

            $(document).on("vclick", "#resume", function (e) {
                mBus.notify("resume");
            });

            $(document).on("vclick", "[data-action='play']", function (e) {
                var songToPlay = $("#playlist a")[0];
                if (!songToPlay) {
                    return;
                }
                var id = $(songToPlay).data("id");
                mBus.notify("play", {id: id});
            });

            $(document).on("vclick", "[data-action='prev']", function (e) {
                mBus.notify("prev");
            });

            $(document).on("vclick", "[data-action='next']", function (e) {
                mBus.notify("next");
            });

            $(document).on("vclick", "[data-action='stop']", function (e) {
                mBus.notify("stop");
            });
        }
    };
});