define([
    'jquery',
    'jqm',
    'qr',
    'editinplace',
    'underscore',
    'mbusRouter',
    'common',
    'demo'
],
function($, jqm, qr, editinplace, _, router, common, demo) {
    return {
        init: function(){
            router.useRoute('demo');
            demo.init();
        }
    };
});