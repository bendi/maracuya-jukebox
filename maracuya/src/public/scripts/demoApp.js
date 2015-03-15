define([
    "jquery",
    "jqm",
    "editinplace",
    "underscore",
    "es6!mbusRouter",
    "es6!common",
    "es6!demo"
],
function ($, jqm, editinplace, _, router, common, demo) {
    return {
        init: function () {
            router.useRoute("demo");
            demo.init();
        }
    };
});
