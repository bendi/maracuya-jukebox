// JZ: encapsulate barcode/qr code scanner.
// use message bus events: scanConfigCode, codeScanned;
define([
    "underscore",
    "config",
    "common",
    "console"
], function (_, config, common, console) {

    var mBus;

    function scanningOk(result) {
        mBus.notify("codeScanned", result.text);
    }

    function scanningError(e) {
        alert("Scanning failed: " + e);
    }

    return {
        init: function (mBus_) {
            mBus = mBus_;
            mBus.addListener("scanConfigCode", function () {
                cordova.plugins.barcodeScanner.scan(scanningOk, scanningError);
            });
        },

        destroy: function () {
            if (mBus) {
                mBus.removeListeners("scanConfigCode");
            }
        }
    };
});