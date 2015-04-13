
import router from "es6!mbusRouter";
import demo from "es6!demo";

export default {
    init: function () {
        router.useRoute("demo");
        demo.init();
    }
};
