var model = require("../model"),
    QueryToQueryStream = require("../util/QueryToQueryStream"),
    Promise = require("node-promise").Promise;

function findWithRadius(id, skip, radius, lt) {
    var q = model.Track.q().order("id");

    if (lt) {
        q = q.where("id").lte(id).skip(skip);
    } else {
        q = q.where("id").gt(id);
    }
    return q.limit(radius).all();
}

function like(col, value) {
    return "`" + col + "`" + " LIKE \"%\" + value + \"%\"";
}

function TrackDao() {}

TrackDao.prototype.getCurrentlyPlaying = function (currentTrackId, pageSize, fn) {
    var data = {items: [], pageSize: pageSize},
        Track = model.Track;

    // get numer of items from start to current
    model.Track.count()
        .error(fn)
        .success(function (total) {
            data.total = total;
            var criteria = {where: "id <= " + currentTrackId};
            model.Track.count(criteria)
                .error(fn)
                .success(function (n) {
                    data.page = Math.ceil(n / pageSize) - 1;
                    var skipTracks = data.page * pageSize;
                    findWithRadius(currentTrackId, skipTracks, pageSize, true)
                        .success(function (lTracks) {
                            if (pageSize > 1) {
                                var limit = pageSize - lTracks.length;
                                console.log("LIMIT: ", limit);
                                if (!limit) {
                                    data.items = Track.lean(lTracks);
                                    fn(null, data);
                                    return;
                                }
                                findWithRadius(currentTrackId, 0, limit)
                                    .success(function (rTracks) {
                                        data.items = Track.lean(lTracks).concat(Track.lean(rTracks));
                                        fn(null, data);
                                    });
                            } else {
                                data.items = Track.lean(lTracks);
                                fn(null, data);
                            }
                        });
                });
        });
};

TrackDao.prototype.findWithLimit = function (pageSize, offset, fn) {
    var q = model.Track.q().order("id");

    model.Track.count().success(function (c) {
        if (pageSize > 0) {
            q = q.limit(pageSize);
        }

        if (offset > 0 && c > offset) {
            q = q.skip(offset);
        }

        q.all().success(function (tracks) {
            fn(null, c, new QueryToQueryStream(tracks));
        });

    })
    .error(function (err) {
        fn(err);
    });
};

TrackDao.prototype.search = function (txt, skip, limit, fn) {
    var criteria = {where: ""};

    if (txt) {
        var or = [];
        or.push(like("title", txt));
        or.push(like("album", txt));
        or.push(like("artist", txt));
        or.push(like("path", txt));
        criteria.where = or.join(" OR ");
    }

    model.Track.count(criteria)
        .error(fn)
        .success(function (total) {
            criteria.limit = limit;
            criteria.offset = skip;
            criteria.order = "id ASC";
            model.Track.findAll(criteria)
                .success(function (tracks) {
                    fn(null, total, new QueryToQueryStream(tracks));
                });
        });
};

TrackDao.prototype.withNext = function (id, fn) {
    model.Track.q().where("id").gte(id).limit(2).all()
        .error(fn)
        .success(function (data) {
            if (!data.length) {
                return fn();
            }

            var ret = {
                current: data[0]
            };

            if (data.length > 1) {
                ret.next = data[1];
            }

            fn(null, ret);
        });
};

TrackDao.prototype.getById = function (id) {
    return model.Track.q().where("id").eq(id).one();
};

TrackDao.prototype.updateById = function (id, data, fn) {
    model.Track.q().where("id").eq(id).one()
        .error(fn)
        .success(function (err, track) {
            track.updateAttributes(data)
                .error(fn)
                .success(function () {
                    fn(null, 1);
                });
        });
};

TrackDao.prototype.create = function (data, fn) {
    model.Track.create(data)
        .error(fn)
        .success(function () {
            console.log("Created: " + JSON.stringify(data));

            fn();
        });
};

TrackDao.prototype.findNext = function (id) {
    return model.Track.q().where("id").gt(id).order("id").one();
};

TrackDao.prototype.findPrev = function (id) {
    return model.Track.q().where("id").lt(id).order("-id").one();
};

module.exports = new TrackDao();