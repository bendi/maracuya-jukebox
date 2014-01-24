define([
    "underscore",
    "console"
],
function (_, console) {

    var routes = {},
        currentRoute;

    function MBus() {
        this.listeners = {};
    }

    /**
     *
     * @param p
     * @param p.event
     * @param p.fn
     * @param p.ctx
     * @param p.once
     */
    MBus.prototype.addListener = function (p, fn) {
        if (typeof(p) === "string") {
            var event = p;
            p = {
                event: event,
                fn: fn
            };
        }
        fn = p.fn;
        if (p.ctx) {
            fn = _.bind(p.fn, p.ctx);
        }

        var listener = _.extend(fn, p);
        this.listeners[p.event] = this.listeners[p.event] || [];
        this.listeners[p.event].push(listener);
    };

    /**
     * @param p
     * @param p.event
     * @param p.fn
     * @param p.ctx
     */
    MBus.prototype.removeListener = function (p) {
        if (!this.listeners[p.event]) {
            return false;
        }

        if (typeof(p.fn) !== "function") {
            this.listeners[p.event] = [];
            return true;
        }
        var idx;
        _.each(this.listeners[p.event], function (listener, i) {
            if (p.fn === listener.fn && p.ctx === listener.ctx) {
                idx = i;
                return false;
            }
        });
        // index not found - quit
        if (idx === undefined) {
            return false;
        }

        this.listeners[p.event].splice(idx, 1);
        return true;
    };

    /**
     * @param p
     * @param p.event
     */
    MBus.prototype.removeListeners = function (p) {
        var event = p;
        if (event && typeof(event) === "object") {
            event = p.event;
        }
        if (!this.listeners[event]) {
            return false;
        }

        this.listeners[event] = [];
        return true;
    };

    /**
     *
     * @param p
     * @param p.event
     * @param p.data
     */
    MBus.prototype.notify = function (event, data) {
        if (typeof(event) !== "string") {
            data = event.data;
            event = event.event;
        }
        if (!this.listeners[event]) {
            return;
        }

        _.each(this.listeners[event], function (listener) {
            try {
                listener(data);
            } catch (e) {
                console.log("[ERROR MBus] ", e);
            }
        });
    };

    return {
        getRoute: function (routeName) {
            if (!routes[routeName]) {
                routes[routeName] = new MBus();
            }
            return routes[routeName];
        },
        cleanRoute: function (routeName) {
            if (routes[routeName]) {
                routes[routeName] = new MBus();
            }
        },
        cleanAllRoutes: function () {
            routes = {};
        },
        useRoute: function (routeName) {
            currentRoute = routes[routeName];
            return currentRoute;
        },
        getAllRoutes: function () {
            return _.keys(routes);
        },
        notify: function (event, data) {
            if (typeof(event) !== "string") {
                data = event.data;
                event = event.event;
            }
            currentRoute.notify(event, data);
        }
    };
});