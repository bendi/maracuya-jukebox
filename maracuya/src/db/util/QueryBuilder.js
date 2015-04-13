function QueryBuilder(ctx, state) {
    this.state = state || {};
    this.ctx = ctx;
}
export default QueryBuilder;

function build(state) {
    var criteria = {};
    if (state.where) {
        criteria.where = [ state.where.col + " " + state.where.op,
                state.where.val ];
    }
    if (state.order) {
        criteria.order = state.order;
    }
    if (state.skip !== undefined) {
        criteria.offset = state.skip;
    }
    if (state.limit !== undefined) {
        criteria.limit = state.limit;
    }
    return criteria;
}

function col(c) {
    return "`" + c + "`";
}
QueryBuilder.prototype._where = function () {
    this.state.where = this.state.where || {};
    return this.state.where;
};
QueryBuilder.prototype._clone = function () {
    var state = {};
    if (this.state.where) {
        state.where = {
            col: this.state.where.col,
            op: this.state.where.op,
            val: this.state.where.val
        };
    }
    if (this.state.order) {
        state.order = this.state.order;
    }
    if (this.state.skip !== undefined) {
        state.skip = this.state.skip;
    }
    if (this.state.limit !== undefined) {
        state.limit = this.state.limit;
    }
    return new QueryBuilder(this.ctx, state);
};
QueryBuilder.prototype.where = function (name) {
    this._where().col = col(name);
    return this._clone();
};
QueryBuilder.prototype.eq = function (val) {
    var where = this._where();
    where.op = "= ?";
    where.val = val;

    return this._clone();
};
QueryBuilder.prototype.gt = function (val) {
    var where = this._where();
    where.op = "> ?";
    where.val = val;

    return this._clone();
};
QueryBuilder.prototype.gte = function (val) {
    var where = this._where();
    where.op = ">= ?";
    where.val = val;

    return this._clone();
};
QueryBuilder.prototype.lt = function (val) {
    var where = this._where();
    where.op = "< ?";
    where.val = val;

    return this._clone();
};
QueryBuilder.prototype.lte = function (val) {
    var where = this._where();
    where.op = "<= ?";
    where.val = val;

    return this._clone();
};
QueryBuilder.prototype.order = function (name) {
    var dir = "ASC";
    if (name.indexOf("-") === 0) {
        dir = "DESC";
        name = name.substring(1);
    }
    this.state.order = col(name) + " " + dir;

    return this._clone();
};
QueryBuilder.prototype.skip = function (skip) {
    this.state.skip = skip;

    return this._clone();
};
QueryBuilder.prototype.limit = function (limit) {
    this.state.limit = limit;

    return this._clone();
};
QueryBuilder.prototype.all = function () {
    return this.ctx.findAll(build(this.state));
};
QueryBuilder.prototype.one = function () {
    return this.ctx.find(build(this.state));
};
QueryBuilder.prototype.count = function () {
    return this.ctx.count(build(this.state));
};
