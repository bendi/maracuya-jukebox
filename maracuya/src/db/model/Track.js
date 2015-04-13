import QueryBuilder from "../util/QueryBuilder";

export default function (sequelize, DataTypes) {
    return sequelize.define("Track", {
        title: DataTypes.STRING,
        artist: DataTypes.STRING,
        album: DataTypes.STRING,
        path: DataTypes.STRING,
        duration: DataTypes.INTEGER
    }, {
        classMethods: {
            lean: function (arr) {
                var ret = [];
                for (var i = 0; i < arr.length; i++) {
                    ret.push(arr[i].lean());
                }
                return ret;
            },
            q: function () {
                return new QueryBuilder(this);
            }
        },
        instanceMethods: {
            lean: function () {
                return {
                    title: this.title,
                    artist: this.artist,
                    album: this.album,
                    path: this.path,
                    duration: this.duration,
                    id: this.id
                };
            }
        }
    });
}
