define([
    "jquery",
    "jqm",
    "editinplace",
    "underscore",
    "mbusRouter",
    "common",
    "demo"
],
function ($, jqm, editinplace, _, router, common, demo) {
    return {
        init: function () {
            router.useRoute("demo");
            demo.init();
        }
    };
});