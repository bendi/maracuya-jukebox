define([
    "jquery",
    "jqm",
    "editinplace",
    "underscore",
    "mbusRouter",
    "es6!common",
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
